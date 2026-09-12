import type {
  CheckInInput, CreateAssignmentInput, CreateClassInput, CreateScheduleSessionInput,
  CreateStudentInput, CreateTeacherInput, EntityId, OperationResult, SchoolClass,
  ScheduleSession, Student, StudentAttendanceSession, SubmitAttendanceInput, Teacher,
  TeacherAssignment, TeacherCheckIn, UpdateClassInput, UpdateStudentInput,
  UpdateTeacherInput, XaadirDataState,
} from "./models";
import type { ActorContext, XaadirAction } from "./permissions";
import { can, canSubmitClassAttendance, canWriteTeacherSession, isSameSchool } from "./permissions";
import { xaadirSeedData } from "./mock-data";

const ok = <T,>(value: T): OperationResult<T> => ({ ok: true, value });
const fail = <T,>(error: string, code: "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID"): OperationResult<T> => ({ ok: false, error, code });
const copyState = (state: XaadirDataState): XaadirDataState => structuredClone(state);

export interface XaadirRepository {
  getSnapshot(): XaadirDataState;
  addTeacher(actor: ActorContext, input: CreateTeacherInput): OperationResult<Teacher>;
  updateTeacher(actor: ActorContext, id: EntityId, input: UpdateTeacherInput): OperationResult<Teacher>;
  removeTeacher(actor: ActorContext, id: EntityId): OperationResult<EntityId>;
  addStudent(actor: ActorContext, input: CreateStudentInput): OperationResult<Student>;
  updateStudent(actor: ActorContext, id: EntityId, input: UpdateStudentInput): OperationResult<Student>;
  removeStudent(actor: ActorContext, id: EntityId): OperationResult<EntityId>;
  addClass(actor: ActorContext, input: CreateClassInput): OperationResult<SchoolClass>;
  updateClass(actor: ActorContext, id: EntityId, input: UpdateClassInput): OperationResult<SchoolClass>;
  removeClass(actor: ActorContext, id: EntityId): OperationResult<EntityId>;
  assignTeacher(actor: ActorContext, input: CreateAssignmentInput): OperationResult<TeacherAssignment>;
  removeAssignment(actor: ActorContext, id: EntityId): OperationResult<EntityId>;
  addScheduleSession(actor: ActorContext, input: CreateScheduleSessionInput): OperationResult<ScheduleSession>;
  checkIn(actor: ActorContext, input: CheckInInput): OperationResult<TeacherCheckIn>;
  submitAttendance(actor: ActorContext, input: SubmitAttendanceInput): OperationResult<StudentAttendanceSession>;
}

class InMemoryXaadirRepository implements XaadirRepository {
  private state: XaadirDataState;
  private sequence = 100;

  constructor(seed: XaadirDataState) { this.state = copyState(seed); }
  getSnapshot() { return copyState(this.state); }
  private id(prefix: string) { this.sequence += 1; return `${prefix}-${this.sequence}`; }
  private authorize<T>(actor: ActorContext, action: XaadirAction): OperationResult<T> | undefined {
    if (!isSameSchool(actor, this.state.school.id)) return fail("This record belongs to another school.", "FORBIDDEN");
    if (!can(actor, action)) return fail("You do not have permission to perform this action.", "FORBIDDEN");
  }
  private exists(id: EntityId, collection: "teachers" | "students" | "classes" | "subjects" | "scheduleSessions") {
    return this.state[collection].some((item) => item.id === id && item.schoolId === this.state.school.id);
  }

  addTeacher(actor: ActorContext, input: CreateTeacherInput) {
    const denied = this.authorize<Teacher>(actor, "teacher:create"); if (denied) return denied;
    if (this.state.teachers.some((teacher) => teacher.employeeId === input.employeeId || teacher.email === input.email)) return fail<Teacher>("Teacher ID and email must be unique.", "CONFLICT");
    if (input.subjectIds.some((id) => !this.exists(id, "subjects"))) return fail<Teacher>("One or more subjects do not exist.", "INVALID");
    const teacher: Teacher = { ...input, name: input.name ?? input.fullName, id: this.id("teacher"), schoolId: actor.schoolId };
    this.state.teachers.push(teacher); return ok(copyState({ ...this.state, teachers: [teacher] }).teachers[0]);
  }
  updateTeacher(actor: ActorContext, id: EntityId, input: UpdateTeacherInput) {
    const denied = this.authorize<Teacher>(actor, "teacher:update"); if (denied) return denied;
    const index = this.state.teachers.findIndex((teacher) => teacher.id === id); if (index < 0) return fail<Teacher>("Teacher not found.", "NOT_FOUND");
    if (input.email && this.state.teachers.some((teacher) => teacher.id !== id && teacher.email === input.email)) return fail<Teacher>("Teacher email must be unique.", "CONFLICT");
    if (input.subjectIds?.some((subjectId) => !this.exists(subjectId, "subjects"))) return fail<Teacher>("One or more subjects do not exist.", "INVALID");
    const teacher = { ...this.state.teachers[index], ...input };
    if (input.fullName && !input.name) teacher.name = input.fullName;
    if (input.name && !input.fullName) teacher.fullName = input.name;
    this.state.teachers[index] = teacher; return ok(structuredClone(teacher));
  }
  removeTeacher(actor: ActorContext, id: EntityId) {
    const denied = this.authorize<EntityId>(actor, "teacher:remove"); if (denied) return denied;
    if (!this.exists(id, "teachers")) return fail<EntityId>("Teacher not found.", "NOT_FOUND");
    const attendanceIds = this.state.attendanceSessions.filter((session) => session.teacherId === id).map((session) => session.id);
    this.state.teachers = this.state.teachers.filter((teacher) => teacher.id !== id);
    this.state.assignments = this.state.assignments.filter((assignment) => assignment.teacherId !== id);
    this.state.scheduleSessions = this.state.scheduleSessions.filter((session) => session.teacherId !== id);
    this.state.teacherCheckIns = this.state.teacherCheckIns.filter((checkIn) => checkIn.teacherId !== id);
    this.state.attendanceSessions = this.state.attendanceSessions.filter((session) => session.teacherId !== id);
    this.state.attendanceRecords = this.state.attendanceRecords.filter((record) => !attendanceIds.includes(record.attendanceSessionId));
    this.state.classes = this.state.classes.map((schoolClass) => schoolClass.homeroomTeacherId === id ? { ...schoolClass, homeroomTeacherId: undefined } : schoolClass);
    return ok(id);
  }
  addStudent(actor: ActorContext, input: CreateStudentInput) {
    const denied = this.authorize<Student>(actor, "student:create"); if (denied) return denied;
    if (!this.exists(input.classId, "classes")) return fail<Student>("Class not found.", "INVALID");
    if (this.state.students.some((student) => student.studentId === input.studentId)) return fail<Student>("Student ID must be unique.", "CONFLICT");
    const schoolClass = this.state.classes.find((item) => item.id === input.classId)!;
    if (this.state.students.filter((student) => student.classId === input.classId && student.status === "ACTIVE").length >= schoolClass.capacity) return fail<Student>("This class is at capacity.", "CONFLICT");
    const student: Student = { ...input, name: input.name ?? input.fullName, id: this.id("student"), schoolId: actor.schoolId }; this.state.students.push(student); return ok(structuredClone(student));
  }
  updateStudent(actor: ActorContext, id: EntityId, input: UpdateStudentInput) {
    const denied = this.authorize<Student>(actor, "student:update"); if (denied) return denied;
    const index = this.state.students.findIndex((student) => student.id === id); if (index < 0) return fail<Student>("Student not found.", "NOT_FOUND");
    if (input.classId && !this.exists(input.classId, "classes")) return fail<Student>("Class not found.", "INVALID");
    const student = { ...this.state.students[index], ...input };
    if (input.fullName && !input.name) student.name = input.fullName;
    if (input.name && !input.fullName) student.fullName = input.name;
    this.state.students[index] = student; return ok(structuredClone(student));
  }
  removeStudent(actor: ActorContext, id: EntityId) {
    const denied = this.authorize<EntityId>(actor, "student:remove"); if (denied) return denied;
    if (!this.exists(id, "students")) return fail<EntityId>("Student not found.", "NOT_FOUND");
    this.state.students = this.state.students.filter((student) => student.id !== id);
    // Submitted attendance is an audit record and remains immutable even after
    // an administrator removes a student from the active roster.
    return ok(id);
  }
  addClass(actor: ActorContext, input: CreateClassInput) {
    const denied = this.authorize<SchoolClass>(actor, "class:create"); if (denied) return denied;
    if (this.state.classes.some((schoolClass) => schoolClass.name === input.name && schoolClass.academicYear === input.academicYear)) return fail<SchoolClass>("Class name must be unique within the academic year.", "CONFLICT");
    if (input.homeroomTeacherId && !this.exists(input.homeroomTeacherId, "teachers")) return fail<SchoolClass>("Homeroom teacher not found.", "INVALID");
    const schoolClass: SchoolClass = { ...input, id: this.id("class"), schoolId: actor.schoolId }; this.state.classes.push(schoolClass); return ok(structuredClone(schoolClass));
  }
  updateClass(actor: ActorContext, id: EntityId, input: UpdateClassInput) {
    const denied = this.authorize<SchoolClass>(actor, "class:update"); if (denied) return denied;
    const index = this.state.classes.findIndex((schoolClass) => schoolClass.id === id); if (index < 0) return fail<SchoolClass>("Class not found.", "NOT_FOUND");
    if (input.homeroomTeacherId && !this.exists(input.homeroomTeacherId, "teachers")) return fail<SchoolClass>("Homeroom teacher not found.", "INVALID");
    const schoolClass = { ...this.state.classes[index], ...input }; this.state.classes[index] = schoolClass; return ok(structuredClone(schoolClass));
  }
  removeClass(actor: ActorContext, id: EntityId) {
    const denied = this.authorize<EntityId>(actor, "class:remove"); if (denied) return denied;
    if (!this.exists(id, "classes")) return fail<EntityId>("Class not found.", "NOT_FOUND");
    if (this.state.students.some((student) => student.classId === id)) return fail<EntityId>("Move or remove enrolled students before deleting this class.", "CONFLICT");
    const attendanceIds = this.state.attendanceSessions.filter((session) => session.classId === id).map((session) => session.id);
    this.state.classes = this.state.classes.filter((schoolClass) => schoolClass.id !== id);
    this.state.assignments = this.state.assignments.filter((assignment) => assignment.classId !== id);
    this.state.scheduleSessions = this.state.scheduleSessions.filter((session) => session.classId !== id);
    this.state.attendanceSessions = this.state.attendanceSessions.filter((session) => session.classId !== id);
    this.state.attendanceRecords = this.state.attendanceRecords.filter((record) => !attendanceIds.includes(record.attendanceSessionId));
    return ok(id);
  }
  assignTeacher(actor: ActorContext, input: CreateAssignmentInput) {
    const denied = this.authorize<TeacherAssignment>(actor, "assignment:manage"); if (denied) return denied;
    if (!this.exists(input.teacherId, "teachers") || !this.exists(input.classId, "classes") || !this.exists(input.subjectId, "subjects")) return fail<TeacherAssignment>("Teacher, class, or subject not found.", "INVALID");
    if (this.state.assignments.some((item) => item.teacherId === input.teacherId && item.classId === input.classId && item.subjectId === input.subjectId)) return fail<TeacherAssignment>("This teacher assignment already exists.", "CONFLICT");
    const assignment: TeacherAssignment = { ...input, id: this.id("assignment"), schoolId: actor.schoolId }; this.state.assignments.push(assignment); return ok(structuredClone(assignment));
  }
  removeAssignment(actor: ActorContext, id: EntityId) {
    const denied = this.authorize<EntityId>(actor, "assignment:manage"); if (denied) return denied;
    if (!this.state.assignments.some((assignment) => assignment.id === id)) return fail<EntityId>("Assignment not found.", "NOT_FOUND");
    this.state.assignments = this.state.assignments.filter((assignment) => assignment.id !== id); return ok(id);
  }
  addScheduleSession(actor: ActorContext, input: CreateScheduleSessionInput) {
    const denied = this.authorize<ScheduleSession>(actor, "schedule:manage"); if (denied) return denied;
    const assigned = this.state.assignments.some((item) => item.teacherId === input.teacherId && item.classId === input.classId && item.subjectId === input.subjectId);
    if (!assigned) return fail<ScheduleSession>("Create the matching teacher assignment before scheduling a session.", "INVALID");
    const session: ScheduleSession = { ...input, id: this.id("schedule"), schoolId: actor.schoolId }; this.state.scheduleSessions.push(session); return ok(structuredClone(session));
  }
  checkIn(actor: ActorContext, input: CheckInInput) {
    const session = this.state.scheduleSessions.find((item) => item.id === input.scheduleSessionId);
    if (!session) return fail<TeacherCheckIn>("Scheduled session not found.", "NOT_FOUND");
    if (!canWriteTeacherSession(actor, session.teacherId) || !isSameSchool(actor, session.schoolId)) return fail<TeacherCheckIn>("Teachers can only check in to their own scheduled sessions.", "FORBIDDEN");
    if (this.state.teacherCheckIns.some((item) => item.scheduleSessionId === session.id && item.date === input.date)) return fail<TeacherCheckIn>("This session has already been checked in.", "CONFLICT");
    const checkIn: TeacherCheckIn = { id: this.id("checkin"), schoolId: actor.schoolId, teacherId: session.teacherId, scheduleSessionId: session.id, date: input.date, checkedInAt: input.checkedInAt ?? new Date().toISOString(), status: "CHECKED_IN" };
    this.state.teacherCheckIns.push(checkIn); return ok(structuredClone(checkIn));
  }
  submitAttendance(actor: ActorContext, input: SubmitAttendanceInput) {
    const schedule = this.state.scheduleSessions.find((item) => item.id === input.scheduleSessionId);
    if (!schedule) return fail<StudentAttendanceSession>("Scheduled session not found.", "NOT_FOUND");
    const assignedTeacherIds = this.state.assignments.filter((item) => item.classId === schedule.classId && item.subjectId === schedule.subjectId).map((item) => item.teacherId);
    if (!canSubmitClassAttendance(actor, schedule.teacherId, assignedTeacherIds) || !isSameSchool(actor, schedule.schoolId)) return fail<StudentAttendanceSession>("Teachers can only submit attendance for their own assigned classes.", "FORBIDDEN");
    const rosterIds = this.state.students.filter((student) => student.classId === schedule.classId && student.status === "ACTIVE").map((student) => student.id).sort();
    const submittedIds = input.records.map((record) => record.studentId).sort();
    if (new Set(submittedIds).size !== submittedIds.length || rosterIds.length !== submittedIds.length || rosterIds.some((id, index) => id !== submittedIds[index])) return fail<StudentAttendanceSession>("Attendance must include each active roster student exactly once.", "INVALID");
    const existing = this.state.attendanceSessions.find((item) => item.scheduleSessionId === schedule.id && item.date === input.date);
    if (existing) {
      this.state.attendanceRecords = this.state.attendanceRecords.filter((record) => record.attendanceSessionId !== existing.id);
      this.state.attendanceRecords.push(...input.records.map((record) => ({ id: this.id("record"), schoolId: actor.schoolId, attendanceSessionId: existing.id, ...record })));
      existing.submittedAt = input.submittedAt ?? new Date().toISOString();
      return ok(structuredClone(existing));
    }
    const attendanceSession: StudentAttendanceSession = { id: this.id("attendance"), schoolId: actor.schoolId, classId: schedule.classId, teacherId: schedule.teacherId, subjectId: schedule.subjectId, scheduleSessionId: schedule.id, date: input.date, submittedAt: input.submittedAt ?? new Date().toISOString() };
    this.state.attendanceSessions.push(attendanceSession);
    this.state.attendanceRecords.push(...input.records.map((record) => ({ id: this.id("record"), schoolId: actor.schoolId, attendanceSessionId: attendanceSession.id, ...record })));
    return ok(structuredClone(attendanceSession));
  }
}

export function createMockXaadirRepository(seed: XaadirDataState = xaadirSeedData): XaadirRepository {
  return new InMemoryXaadirRepository(seed);
}
