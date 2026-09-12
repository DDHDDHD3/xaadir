import type { EntityId, UserRole } from "./models";

export type XaadirAction =
  | "teacher:create" | "teacher:update" | "teacher:remove"
  | "student:create" | "student:update" | "student:remove"
  | "class:create" | "class:update" | "class:remove"
  | "assignment:manage" | "schedule:manage"
  | "academic:read"
  | "teacher:check-in"
  | "attendance:submit";

export interface ActorContext {
  userId: EntityId;
  schoolId: EntityId;
  role: UserRole;
  teacherId?: EntityId;
}

const rolePermissions: Readonly<Record<UserRole, ReadonlySet<XaadirAction>>> = {
  ADMIN: new Set<XaadirAction>([
    "teacher:create", "teacher:update", "teacher:remove",
    "student:create", "student:update", "student:remove",
    "class:create", "class:update", "class:remove",
    "assignment:manage", "schedule:manage", "academic:read",
  ]),
  TEACHER: new Set<XaadirAction>(["academic:read", "teacher:check-in", "attendance:submit"]),
};

export function can(actor: ActorContext, action: XaadirAction): boolean {
  return rolePermissions[actor.role].has(action);
}

export function isSameSchool(actor: ActorContext, schoolId: EntityId): boolean {
  return actor.schoolId === schoolId;
}

export function isOwnTeacherRecord(actor: ActorContext, teacherId: EntityId): boolean {
  return actor.role === "TEACHER" && actor.teacherId === teacherId;
}

export function canWriteTeacherSession(actor: ActorContext, teacherId: EntityId): boolean {
  return can(actor, "teacher:check-in") && isOwnTeacherRecord(actor, teacherId);
}

export function canSubmitClassAttendance(
  actor: ActorContext,
  teacherId: EntityId,
  assignedTeacherIds: readonly EntityId[],
): boolean {
  return can(actor, "attendance:submit")
    && isOwnTeacherRecord(actor, teacherId)
    && assignedTeacherIds.includes(teacherId);
}

export function permissionsFor(role: UserRole): readonly XaadirAction[] {
  return Array.from(rolePermissions[role]);
}
