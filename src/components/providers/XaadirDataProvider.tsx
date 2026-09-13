"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  CheckInInput, CreateAssignmentInput, CreateClassInput, CreateScheduleSessionInput,
  CreateStudentInput, CreateTeacherInput, EntityId, OperationResult, SchoolClass,
  ScheduleSession, Student, StudentAttendanceSession, SubmitAttendanceInput, Teacher,
  TeacherAssignment, TeacherCheckIn, TeacherWorkSession, UpdateClassInput, UpdateStudentInput,
  UpdateTeacherInput, XaadirDataState, UpdateAccountInput, UserAccount, UpdateAdminProfileInput, UpdateSchoolInput, AdminProfile, School, UpdateAdminAccountInput,
} from "@/lib/models";
import type { ActorContext } from "@/lib/permissions";
import { createMockXaadirRepository, type XaadirRepository } from "@/lib/repository";
import { xaadirSeedData } from "@/lib/mock-data";
import type { MessageAttachment, ReportRequest, XaadirMessage, XaadirNotification } from "@/lib/messages";

export interface XaadirDataContextValue {
  state: XaadirDataState;
  actor: ActorContext;
  setActor(actor: ActorContext): void;
  addTeacher(input: CreateTeacherInput): OperationResult<Teacher>;
  updateTeacher(id: EntityId, input: UpdateTeacherInput): OperationResult<Teacher>;
  updateAccount(teacherId: EntityId, input: UpdateAccountInput): OperationResult<UserAccount>;
  updateAdminAccount(input: UpdateAdminAccountInput): OperationResult<UserAccount>;
  updateAdminProfile(input: UpdateAdminProfileInput): OperationResult<AdminProfile>;
  updateSchool(input: UpdateSchoolInput): OperationResult<School>;
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
  messages: XaadirMessage[];
  sendMessage(input: { recipientUserId: string; recipientName: string; body: string; attachment?: MessageAttachment; forwardedFromMessageId?: string }): XaadirMessage;
  markMessagesRead(ids: string[]): void;
  notifications: XaadirNotification[];
  markNotificationsRead(ids: string[]): void;
  reportRequests: ReportRequest[];
  createReportRequest(input: Omit<ReportRequest, "id" | "messageId" | "status" | "createdAt"> & { note: string; teacherName: string }): { ok: true; request: ReportRequest } | { ok: false; error: string; request?: ReportRequest };
  completeReportRequest(input: { teacherId: string; assignmentId: string; month: string; reportSubmissionId: string; responseMessageId: string }): void;
}

const adminActor: ActorContext = { userId: "user-admin", schoolId: "school-xaadir", role: "ADMIN" };
const XaadirDataContext = createContext<XaadirDataContextValue | null>(null);

export function XaadirDataProvider({ children, initialActor = adminActor }: { children: ReactNode; initialActor?: ActorContext }) {
  const [repository] = useState<XaadirRepository>(() => { try { const raw = window.localStorage.getItem("xaadir-data"); const parsed = raw ? JSON.parse(raw) : null; return createMockXaadirRepository(parsed ? { ...xaadirSeedData, ...parsed, accounts: parsed.accounts ?? xaadirSeedData.accounts } : xaadirSeedData); } catch { return createMockXaadirRepository(); } });
  const [state, setState] = useState<XaadirDataState>(() => repository.getSnapshot());
  const [actor, setActor] = useState(initialActor);
  const [workSession, setWorkSession] = useState<TeacherWorkSession | null>(null);
  const [messages, setMessages] = useState<XaadirMessage[]>(() => { try { const raw=window.localStorage.getItem("xaadir-messages"); return raw?JSON.parse(raw):[]; } catch { return []; } });
  const [notifications, setNotifications] = useState<XaadirNotification[]>(() => { try { const raw=window.localStorage.getItem("xaadir-notifications"); return raw?JSON.parse(raw):[]; } catch { return []; } });
  const [reportRequests, setReportRequests] = useState<ReportRequest[]>(() => { try { const raw=window.localStorage.getItem("xaadir-report-requests"); return raw?JSON.parse(raw):[]; } catch { return []; } });
  useEffect(() => { try { const raw = window.localStorage.getItem("xaadir-work-session"); if (raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkSession(JSON.parse(raw));
    } } catch { /* demo storage unavailable */ } }, []);
  const persistWork = (next: TeacherWorkSession | null) => { setWorkSession(next); if (next) window.localStorage.setItem("xaadir-work-session", JSON.stringify(next)); else window.localStorage.removeItem("xaadir-work-session"); };
  const persistMessages = (next: XaadirMessage[]) => { setMessages(next); try { window.localStorage.setItem("xaadir-messages", JSON.stringify(next)); } catch { /* storage unavailable */ } };
  const persistNotifications = (next: XaadirNotification[]) => { setNotifications(next); try { window.localStorage.setItem("xaadir-notifications", JSON.stringify(next)); } catch { /* storage unavailable */ } };
  const persistReportRequests = (next: ReportRequest[]) => { setReportRequests(next); try { window.localStorage.setItem("xaadir-report-requests", JSON.stringify(next)); } catch { /* storage unavailable */ } };
  const mutate = useCallback(<T,>(operation: (repo: XaadirRepository) => OperationResult<T>) => {
    const before = repository.getSnapshot();
    const result = operation(repository);
    if (result.ok) { const next = repository.getSnapshot(); try { window.localStorage.setItem("xaadir-data", JSON.stringify(next)); setState(next); } catch { repository.restore(before); return { ok: false, code: "INVALID", error: "Could not save school data. Free device storage and try again. Your changes have not been saved." } as OperationResult<T>; } }
    return result;
  }, [repository]);

  const value: XaadirDataContextValue = {
    state, actor, setActor,
    addTeacher: (input) => mutate((repo) => repo.addTeacher(actor, input)), updateAdminProfile: (input) => mutate((repo) => repo.updateAdminProfile(actor, input)), updateAdminAccount: (input) => mutate((repo) => repo.updateAdminAccount(actor, input)), updateSchool: (input) => mutate((repo) => repo.updateSchool(actor, input)),
    updateTeacher: (id, input) => mutate((repo) => repo.updateTeacher(actor, id, input)),
    updateAccount: (teacherId, input) => mutate((repo) => repo.updateAccount(actor, teacherId, input)),
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
    messages,
    sendMessage: (input) => { const message: XaadirMessage = { id: `message-${crypto.randomUUID()}`, senderUserId: actor.userId, senderName: actor.role === "ADMIN" ? state.adminProfile.fullName : state.teachers.find(t=>t.id===actor.teacherId)?.fullName ?? "Teacher", recipientUserId: actor.role === "ADMIN" ? input.recipientUserId : "user-admin", recipientName: input.recipientName, body: input.body.trim(), createdAt: new Date().toISOString(), attachment: input.attachment, forwardedFromMessageId: input.forwardedFromMessageId }; persistMessages([...messages, message]); persistNotifications([...notifications,{id:`notification-${crypto.randomUUID()}`,recipientUserId:message.recipientUserId,title:`New message from ${message.senderName}`,body:message.body,createdAt:message.createdAt,messageId:message.id}]); return message; },
    markMessagesRead: (ids) => persistMessages(messages.map(message => ids.includes(message.id) ? { ...message, readAt: message.readAt ?? new Date().toISOString() } : message)),
    notifications,
    markNotificationsRead: (ids) => persistNotifications(notifications.map(notification => ids.includes(notification.id) ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() } : notification)),
    reportRequests,
    createReportRequest: (input) => {
      const existing = reportRequests.find(request => request.teacherId === input.teacherId && request.assignmentId === input.assignmentId && request.month === input.month && request.status === "PENDING");
      if (existing) return { ok: false, error: "A report request is already pending.", request: existing };
      const requestId = `report-request-${crypto.randomUUID()}`;
      const message: XaadirMessage = { id: `message-${crypto.randomUUID()}`, senderUserId: actor.userId, senderName: state.adminProfile.fullName, recipientUserId: input.teacherUserId, recipientName: input.teacherName, body: input.note.trim() || "Please submit this month's attendance report.", createdAt: new Date().toISOString(), attachment: { type: "REPORT_REQUEST", entityId: requestId, label: input.month, teacherId: input.teacherId, assignmentId: input.assignmentId, classId: input.classId, subjectId: input.subjectId, month: input.month } };
      const request: ReportRequest = { ...input, id: requestId, messageId: message.id, status: "PENDING", createdAt: message.createdAt };
      persistMessages([...messages, message]);
      persistNotifications([...notifications, { id: `notification-${crypto.randomUUID()}`, recipientUserId: input.teacherUserId, title: "Monthly report requested", body: input.month, createdAt: message.createdAt, messageId: message.id }]);
      persistReportRequests([...reportRequests, request]);
      return { ok: true, request };
    },
    completeReportRequest: (input) => persistReportRequests(reportRequests.map(request => request.teacherId === input.teacherId && request.assignmentId === input.assignmentId && request.month === input.month && request.status === "PENDING" ? { ...request, status: "SUBMITTED", submittedAt: new Date().toISOString(), reportSubmissionId: input.reportSubmissionId, responseMessageId: input.responseMessageId } : request)),
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
