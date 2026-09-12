import type {
  SchoolClass,
  ScheduleSession,
  Student,
  AttendanceStatus,
  Subject,
  Teacher,
  TeacherCheckIn,
} from "@/lib/models";

export type TeacherSection =
  | "dashboard"
  | "classes"
  | "attendance"
  | "schedule"
  | "my-attendance"
  | "profile"
  | "help"
  | "reports";


export interface TeacherClassSummary {
  schoolClass: SchoolClass;
  subject: Subject;
  students: Student[];
  nextSession?: ScheduleSession;
}

export interface TeacherAttendanceHistoryItem extends TeacherCheckIn {
  schoolClass?: SchoolClass;
  subject?: Subject;
  session?: ScheduleSession;
}

export interface AttendanceDraftRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface TeacherViewModel {
  teacher: Teacher;
  classes: TeacherClassSummary[];
  todaySessions: ScheduleSession[];
  checkIns: TeacherAttendanceHistoryItem[];
}
