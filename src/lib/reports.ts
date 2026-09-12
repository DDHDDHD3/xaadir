import type { Student, StudentAttendanceRecord, StudentAttendanceSession, SchoolClass, Subject, Teacher } from "./models";
export function generateMonthlyClassReport(input:{school?: {name:string}; teacher:Teacher; schoolClass:SchoolClass; subject:Subject; students:Student[]; sessions:StudentAttendanceSession[]; records:StudentAttendanceRecord[]; month:string}){
 const sessionIds=new Set(input.sessions.map(s=>s.id)); const records=input.records.filter(r=>sessionIds.has(r.attendanceSessionId));
 const students=input.students.map(student=>{const mine=records.filter(r=>r.studentId===student.id);const counts={PRESENT:0,ABSENT:0,LATE:0,EXCUSED:0};mine.forEach(r=>{counts[r.status]++});const rate=mine.length?((counts.PRESENT+counts.LATE)/mine.length)*100:0;return {...student,counts,rate};});
 const totals=records.reduce((a,r)=>({...a,[r.status]:a[r.status]+1}),{PRESENT:0,ABSENT:0,LATE:0,EXCUSED:0});
 return { ...input, school: input.school ?? { name: "Xaadir Academy" }, records, studentRows:students, totals, sessionCount:input.sessions.length, averageAttendance:records.length?((totals.PRESENT+totals.LATE)/records.length)*100:0 };
}
export type MonthlyReport=ReturnType<typeof generateMonthlyClassReport>;
