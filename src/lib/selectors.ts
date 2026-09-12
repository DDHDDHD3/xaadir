import type { EntityId, XaadirDataState } from "./models";

export function getStudentsForClass(state: XaadirDataState, classId: EntityId) {
  return state.students.filter((student) => student.classId === classId);
}

export function getAssignmentsForTeacher(state: XaadirDataState, teacherId: EntityId) {
  return state.assignments.filter((assignment) => assignment.teacherId === teacherId);
}

export function getClassesForTeacher(state: XaadirDataState, teacherId: EntityId) {
  const classIds = new Set(getAssignmentsForTeacher(state, teacherId).map((assignment) => assignment.classId));
  return state.classes.filter((schoolClass) => classIds.has(schoolClass.id));
}

export function getScheduleForTeacher(state: XaadirDataState, teacherId: EntityId) {
  return state.scheduleSessions.filter((session) => session.teacherId === teacherId);
}

export function getTeacherRoster(state: XaadirDataState, teacherId: EntityId, classId: EntityId) {
  const assigned = state.assignments.some((assignment) => assignment.teacherId === teacherId && assignment.classId === classId);
  return assigned ? getStudentsForClass(state, classId) : [];
}

export function suggestNextStudentId(state: XaadirDataState) {
  const highest = state.students.reduce((max, student) => {
    const number = Number.parseInt(student.studentId.replace(/\D/g, ""), 10);
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);
  return `ST-${String(highest + 1).padStart(4, "0")}`;
}
