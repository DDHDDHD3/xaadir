export type EntityId = string;

export type UserRole = "ADMIN" | "TEACHER";
export type EmploymentStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";
export type StudentStatus = "ACTIVE" | "INACTIVE";
export type SessionStatus = "SCHEDULED" | "CHECKED_IN" | "COMPLETED" | "MISSED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type StudentAttendanceStatus = AttendanceStatus;
export type TeacherCheckInStatus = "CHECKED_IN" | "LATE" | "MISSED";
export type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface School {
  id: EntityId;
  name: string;
  slug: string;
  timezone: string;
  academicYear: string;
  shortName?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  attendanceDays?: Weekday[];
}

export interface AdminProfile { id: EntityId; schoolId: EntityId; fullName: string; email: string; contactEmail?: string; phone?: string; profileImage?: string; role: "ADMIN"; createdAt: string; updatedAt?: string; }

export interface User {
  id: EntityId;
  schoolId: EntityId;
  role: UserRole;
  name: string;
  email: string;
  teacherId?: EntityId;
}
export interface UserAccount { id: EntityId; schoolId: EntityId; email: string; password: string; role: UserRole; teacherId?: EntityId; status: "ACTIVE" | "INACTIVE"; createdAt: string; }

export interface Teacher {
  id: EntityId;
  schoolId: EntityId;
  employeeId: string;
  fullName: string;
  /** Display-name alias retained for concise view models. */
  name: string;
  email: string;
  phone: string;
  gender?: "FEMALE" | "MALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  profileImage?: string;
  status: EmploymentStatus;
  subjectIds: EntityId[];
  accountEmail: string;
  accountStatus: "INVITED" | "ACTIVE" | "SUSPENDED";
}

export interface Student {
  id: EntityId;
  schoolId: EntityId;
  studentId: string;
  fullName: string;
  /** Display-name alias retained for register and attendance views. */
  name: string;
  classId: EntityId;
  section: string;
  guardianName?: string;
  guardianPhone?: string;
  status: StudentStatus;
}

export interface SchoolClass {
  id: EntityId;
  schoolId: EntityId;
  name: string;
  grade: string;
  section: string;
  room?: string;
  academicYear: string;
  capacity: number;
  homeroomTeacherId?: EntityId;
}

/** `SchoolClass` is the canonical domain name; `Class` is a UI-friendly alias. */
export type Class = SchoolClass;

export interface Subject {
  id: EntityId;
  schoolId: EntityId;
  name: string;
  code: string;
}

export interface TeacherAssignment {
  id: EntityId;
  schoolId: EntityId;
  teacherId: EntityId;
  classId: EntityId;
  subjectId: EntityId;
}

export interface ScheduleSession {
  id: EntityId;
  schoolId: EntityId;
  teacherId: EntityId;
  classId: EntityId;
  subjectId: EntityId;
  day: Weekday;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface TeacherCheckIn {
  id: EntityId;
  schoolId: EntityId;
  teacherId: EntityId;
  scheduleSessionId: EntityId;
  date: string;
  checkedInAt: string;
  status: TeacherCheckInStatus;
}
export type TeacherWorkSessionStatus = "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT";
export interface TeacherWorkSession { id: EntityId; teacherId: EntityId; date: string; checkInTime?: string; checkOutTime?: string; status: TeacherWorkSessionStatus; }

export interface StudentAttendanceSession {
  id: EntityId;
  schoolId: EntityId;
  classId: EntityId;
  teacherId: EntityId;
  subjectId: EntityId;
  scheduleSessionId: EntityId;
  date: string;
  submittedAt: string;
}

export interface StudentAttendanceRecord {
  id: EntityId;
  schoolId: EntityId;
  attendanceSessionId: EntityId;
  studentId: EntityId;
  status: AttendanceStatus;
}

export interface XaadirDataState {
  school: School;
  adminProfile: AdminProfile;
  users: User[];
  accounts: UserAccount[];
  teachers: Teacher[];
  students: Student[];
  classes: SchoolClass[];
  subjects: Subject[];
  assignments: TeacherAssignment[];
  scheduleSessions: ScheduleSession[];
  teacherCheckIns: TeacherCheckIn[];
  attendanceSessions: StudentAttendanceSession[];
  attendanceRecords: StudentAttendanceRecord[];
}
export type UpdateAccountInput = Partial<Pick<UserAccount, "password" | "status" | "email">>;
export type UpdateAdminAccountInput = UpdateAccountInput & { currentPassword?: string };
export type UpdateAdminProfileInput = Partial<Pick<AdminProfile, "fullName" | "contactEmail" | "phone" | "profileImage">>;
export type UpdateSchoolInput = Partial<Omit<School, "id" | "slug">>;

export type CreateTeacherInput = Omit<Teacher, "id" | "schoolId" | "name"> & { name?: string; password?: string; classIds?: string[]; scheduleDay?: Weekday; startTime?: string; endTime?: string };
export type UpdateTeacherInput = Partial<Omit<Teacher, "id" | "schoolId" | "employeeId">> & { password?: string };
export type CreateStudentInput = Omit<Student, "id" | "schoolId" | "name"> & { name?: string };
export type UpdateStudentInput = Partial<Omit<Student, "id" | "schoolId" | "studentId">>;
export type CreateClassInput = Omit<SchoolClass, "id" | "schoolId">;
export type UpdateClassInput = Partial<Omit<SchoolClass, "id" | "schoolId">>;
export type CreateAssignmentInput = Omit<TeacherAssignment, "id" | "schoolId">;
export type CreateScheduleSessionInput = Omit<ScheduleSession, "id" | "schoolId">;

export interface SubmitAttendanceInput {
  scheduleSessionId: EntityId;
  date: string;
  submittedAt?: string;
  records: Array<{ studentId: EntityId; status: AttendanceStatus }>;
}

export interface CheckInInput {
  scheduleSessionId: EntityId;
  date: string;
  checkedInAt?: string;
}

export type OperationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code: "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID" };
