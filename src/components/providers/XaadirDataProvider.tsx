"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  CheckInInput, CreateAssignmentInput, CreateClassInput, CreateScheduleSessionInput,
  CreateStudentInput, CreateTeacherInput, EntityId, OperationResult, SchoolClass,
  ScheduleSession, Student, StudentAttendanceSession, SubmitAttendanceInput, Teacher,
  TeacherAssignment, TeacherCheckIn, TeacherWorkSession, UpdateClassInput, UpdateStudentInput,
  UpdateTeacherInput, XaadirDataState,
} from "@/lib/models";
import type { ActorContext } from "@/lib/permissions";
import { createMockXaadirRepository, type XaadirRepository } from "@/lib/repository";

export interface XaadirDataContextValue {
  state: XaadirDataState;
  actor: ActorContext;
  setActor(actor: ActorContext): void;
  addTeacher(input: CreateTeacherInput): OperationResult<Teacher>;
  updateTeacher(id: EntityId, input: UpdateTeacherInput): OperationResult<Teacher>;
  removeTeacher(id: EntityId): OperationResult<EntityId>;
  addStudent(input: CreateStudentInput): OperationResult<Student>;
  updateStudent(id: EntityId, input: UpdateStudentInput): OperationResult<Student>;
  removeStudent(id: EntityId): OperationResult<EntityId>;
  addClass(input: CreateClassInput): OperationResult<SchoolClass>;
  updateClass(id: EntityId, input: UpdateClassInput): OperationResult<SchoolClass>;
  removeClass(id: EntityId): OperationResult<EntityId>;
  assignTeacher(input: CreateAssignmentInput): OperationResult<TeacherAssignment>;
  removeAssignment(id: EntityId): OperationResult<EntityId>;
  addScheduleSession(input: CreateScheduleSessionInput): OperationResult<ScheduleSession>;
  checkIn(input: CheckInInput): OperationResult<TeacherCheckIn>;
  submitAttendance(input: SubmitAttendanceInput): OperationResult<StudentAttendanceSession>;
  workSession: TeacherWorkSession | null;
  checkInWork(): void;
  checkOutWork(): void;
}

const adminActor: ActorContext = { userId: "user-admin", schoolId: "school-xaadir", role: "ADMIN" };
const XaadirDataContext = createContext<XaadirDataContextValue | null>(null);

export function XaadirDataProvider({ children, initialActor = adminActor }: { children: ReactNode; initialActor?: ActorContext }) {
  const [repository] = useState<XaadirRepository>(() => createMockXaadirRepository());
  const [state, setState] = useState<XaadirDataState>(() => repository.getSnapshot());
  const [actor, setActor] = useState(initialActor);
  const [workSession, setWorkSession] = useState<TeacherWorkSession | null>(null);
  useEffect(() => { try { const raw = window.localStorage.getItem("xaadir-work-session"); if (raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkSession(JSON.parse(raw));
    } } catch { /* demo storage unavailable */ } }, []);
  const persistWork = (next: TeacherWorkSession | null) => { setWorkSession(next); if (next) window.localStorage.setItem("xaadir-work-session", JSON.stringify(next)); else window.localStorage.removeItem("xaadir-work-session"); };
  const mutate = useCallback(<T,>(operation: (repo: XaadirRepository) => OperationResult<T>) => {
    const result = operation(repository);
    if (result.ok) setState(repository.getSnapshot());
    return result;
  }, [repository]);

  const value: XaadirDataContextValue = {
    state, actor, setActor,
    addTeacher: (input) => mutate((repo) => repo.addTeacher(actor, input)),
    updateTeacher: (id, input) => mutate((repo) => repo.updateTeacher(actor, id, input)),
    removeTeacher: (id) => mutate((repo) => repo.removeTeacher(actor, id)),
    addStudent: (input) => mutate((repo) => repo.addStudent(actor, input)),
    updateStudent: (id, input) => mutate((repo) => repo.updateStudent(actor, id, input)),
    removeStudent: (id) => mutate((repo) => repo.removeStudent(actor, id)),
    addClass: (input) => mutate((repo) => repo.addClass(actor, input)),
    updateClass: (id, input) => mutate((repo) => repo.updateClass(actor, id, input)),
    removeClass: (id) => mutate((repo) => repo.removeClass(actor, id)),
    assignTeacher: (input) => mutate((repo) => repo.assignTeacher(actor, input)),
    removeAssignment: (id) => mutate((repo) => repo.removeAssignment(actor, id)),
    addScheduleSession: (input) => mutate((repo) => repo.addScheduleSession(actor, input)),
    checkIn: (input) => mutate((repo) => repo.checkIn(actor, input)),
    submitAttendance: (input) => mutate((repo) => repo.submitAttendance(actor, input)),
    workSession,
    checkInWork: () => persistWork({ id: `work-${actor.teacherId ?? actor.userId}`, teacherId: actor.teacherId ?? actor.userId, date: new Date().toISOString().slice(0, 10), checkInTime: new Date().toISOString(), status: "CHECKED_IN" }),
    checkOutWork: () => workSession && persistWork({ ...workSession, checkOutTime: new Date().toISOString(), status: "CHECKED_OUT" }),
  };
  return <XaadirDataContext.Provider value={value}>{children}</XaadirDataContext.Provider>;
}

export function useXaadirData() {
  const context = useContext(XaadirDataContext);
  if (!context) throw new Error("useXaadirData must be used within XaadirDataProvider.");
  return context;
}

export const mockActors = {
  admin: adminActor,
  teacher: { userId: "user-teacher-ahmed", schoolId: "school-xaadir", role: "TEACHER", teacherId: "teacher-ahmed" } satisfies ActorContext,
} as const;
