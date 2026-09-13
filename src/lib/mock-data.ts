import type { XaadirDataState } from "./models";

export const xaadirSeedData: XaadirDataState = {
  school: { id: "school-xaadir", name: "Xaadir Academy", slug: "xaadir-academy", timezone: "Africa/Mogadishu", academicYear: "2026–2027", shortName: "Xaadir", attendanceDays: ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY"] },
  adminProfile: { id: "admin-profile", schoolId: "school-xaadir", fullName: "Xaadir School Admin", email: "admin.xaadir.demo@gmail.com", contactEmail: "admin.xaadir.demo@gmail.com", role: "ADMIN", createdAt: "2026-01-01" },
  users: [
    { id: "user-admin", schoolId: "school-xaadir", role: "ADMIN", name: "Xaadir School Admin", email: "admin.xaadir.demo@gmail.com" },
    { id: "user-teacher-ahmed", schoolId: "school-xaadir", role: "TEACHER", name: "Ahmed Hassan", email: "ahmed@xaadir.school", teacherId: "teacher-ahmed" },
  ],
  accounts: [
    { id: "account-admin", schoolId: "school-xaadir", email: "admin.xaadir.demo@gmail.com", password: "XaadirAdmin#2026", role: "ADMIN", status: "ACTIVE", createdAt: "2026-01-01" },
    { id: "account-ahmed", schoolId: "school-xaadir", email: "teacher.xaadir.demo@gmail.com", password: "XaadirTeacher#2026", role: "TEACHER", teacherId: "teacher-ahmed", status: "ACTIVE", createdAt: "2026-01-01" },
  ],
  subjects: [
    { id: "subject-math", schoolId: "school-xaadir", name: "Mathematics", code: "MATH" },
    { id: "subject-english", schoolId: "school-xaadir", name: "English", code: "ENG" },
    { id: "subject-science", schoolId: "school-xaadir", name: "Science", code: "SCI" },
    { id: "subject-somali", schoolId: "school-xaadir", name: "Somali", code: "SOM" },
  ],
  teachers: [
    { id: "teacher-ahmed", schoolId: "school-xaadir", employeeId: "TCH-001", fullName: "Ahmed Hassan", name: "Ahmed Hassan", email: "teacher.xaadir.demo@gmail.com", phone: "+252 61 555 0101", gender: "MALE", status: "ACTIVE", subjectIds: ["subject-math"], accountEmail: "teacher.xaadir.demo@gmail.com", accountStatus: "ACTIVE" },
    { id: "teacher-fatima", schoolId: "school-xaadir", employeeId: "TCH-1002", fullName: "Fatima Ali", name: "Fatima Ali", email: "fatima@xaadir.school", phone: "+252 61 555 0102", gender: "FEMALE", status: "ACTIVE", subjectIds: ["subject-english"], accountEmail: "fatima@xaadir.school", accountStatus: "ACTIVE" },
    { id: "teacher-mohamed", schoolId: "school-xaadir", employeeId: "TCH-1003", fullName: "Mohamed Yusuf", name: "Mohamed Yusuf", email: "mohamed@xaadir.school", phone: "+252 61 555 0103", gender: "MALE", status: "ACTIVE", subjectIds: ["subject-science"], accountEmail: "mohamed@xaadir.school", accountStatus: "ACTIVE" },
    { id: "teacher-hodan", schoolId: "school-xaadir", employeeId: "TCH-1004", fullName: "Hodan Abdi", name: "Hodan Abdi", email: "hodan@xaadir.school", phone: "+252 61 555 0104", gender: "FEMALE", status: "ON_LEAVE", subjectIds: ["subject-somali"], accountEmail: "hodan@xaadir.school", accountStatus: "ACTIVE" },
  ],
  classes: [
    { id: "class-7a", schoolId: "school-xaadir", name: "Grade 7A", grade: "7", section: "A", room: "R-12", academicYear: "2026–2027", capacity: 36, homeroomTeacherId: "teacher-fatima" },
    { id: "class-8a", schoolId: "school-xaadir", name: "Grade 8A", grade: "8", section: "A", room: "R-18", academicYear: "2026–2027", capacity: 36, homeroomTeacherId: "teacher-ahmed" },
    { id: "class-8b", schoolId: "school-xaadir", name: "Grade 8B", grade: "8", section: "B", room: "R-19", academicYear: "2026–2027", capacity: 34 },
    { id: "class-9a", schoolId: "school-xaadir", name: "Grade 9A", grade: "9", section: "A", room: "R-22", academicYear: "2026–2027", capacity: 32, homeroomTeacherId: "teacher-mohamed" },
    { id: "class-9b", schoolId: "school-xaadir", name: "Grade 9B", grade: "9", section: "B", room: "R-23", academicYear: "2026–2027", capacity: 32 },
  ],
  students: [
    ["student-1", "ST-0001", "Abdirahman Ali", "class-8a"], ["student-2", "ST-0002", "Hodan Hassan", "class-8a"],
    ["student-3", "ST-0003", "Mohamed Ahmed", "class-8a"], ["student-4", "ST-0004", "Amina Omar", "class-8a"],
    ["student-5", "ST-0005", "Maryan Noor", "class-8a"], ["student-6", "ST-0006", "Yusuf Aden", "class-8a"],
    ["student-7", "ST-0007", "Ilyas Jama", "class-9b"], ["student-8", "ST-0008", "Sahra Warsame", "class-9b"],
    ["student-9", "ST-0009", "Hamza Farah", "class-7a"], ["student-10", "ST-0010", "Ifrah Ibrahim", "class-9a"],
  ].map(([id, studentId, fullName, classId]) => ({ id, schoolId: "school-xaadir", studentId, fullName, name: fullName, classId, section: classId.slice(-1).toUpperCase(), status: "ACTIVE" as const })),
  assignments: [
    { id: "assignment-1", schoolId: "school-xaadir", teacherId: "teacher-ahmed", classId: "class-8a", subjectId: "subject-math" },
    { id: "assignment-2", schoolId: "school-xaadir", teacherId: "teacher-ahmed", classId: "class-9b", subjectId: "subject-math" },
    { id: "assignment-3", schoolId: "school-xaadir", teacherId: "teacher-fatima", classId: "class-7a", subjectId: "subject-english" },
    { id: "assignment-4", schoolId: "school-xaadir", teacherId: "teacher-mohamed", classId: "class-9a", subjectId: "subject-science" },
  ],
  scheduleSessions: [
    { id: "schedule-8a-math", schoolId: "school-xaadir", teacherId: "teacher-ahmed", classId: "class-8a", subjectId: "subject-math", day: "SATURDAY", startTime: "10:00", endTime: "10:45", room: "R-18" },
    { id: "schedule-9b-math", schoolId: "school-xaadir", teacherId: "teacher-ahmed", classId: "class-9b", subjectId: "subject-math", day: "SUNDAY", startTime: "12:00", endTime: "12:45", room: "R-23" },
    { id: "schedule-7a-english", schoolId: "school-xaadir", teacherId: "teacher-fatima", classId: "class-7a", subjectId: "subject-english", day: "SATURDAY", startTime: "08:00", endTime: "08:45", room: "R-12" },
  ],
  teacherCheckIns: [
    { id: "checkin-1", schoolId: "school-xaadir", teacherId: "teacher-ahmed", scheduleSessionId: "schedule-8a-math", date: "2026-09-11", checkedInAt: "2026-09-11T07:02:00.000Z", status: "CHECKED_IN" },
  ],
  attendanceSessions: [],
  attendanceRecords: [],
};
