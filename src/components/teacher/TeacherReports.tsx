"use client";
import { FileSpreadsheet, FileText, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useXaadirData } from "@/components/providers";
import { generateMonthlyClassReport } from "@/lib/reports";
import { renderMonthlyAttendancePdf } from "@/lib/reports/pdfTemplate";
import styles from "./teacher.module.css";

export function TeacherReports({ teacherId }: { teacherId: string }) {
  const searchParams = useSearchParams();
  const { state, sendMessage, completeReportRequest } = useXaadirData();
  const teacher = state.teachers.find(item => item.id === teacherId);
  const assignments = state.assignments.filter(item => item.teacherId === teacherId);
  const requestedAssignment = searchParams.get("assignmentId");
  const requestedMonth = searchParams.get("month");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(() => assignments.some(item => item.id === requestedAssignment) ? requestedAssignment! : assignments[0]?.id ?? "");
  const [month, setMonth] = useState(() => /^\d{4}-\d{2}$/.test(requestedMonth ?? "") ? requestedMonth! : new Date().toISOString().slice(0, 7));
  const [submitted, setSubmitted] = useState(false);
  const assignment = assignments.find(item => item.id === selectedAssignmentId) ?? assignments[0];
  const schoolClass = assignment && state.classes.find(item => item.id === assignment.classId);
  const subject = assignment && state.subjects.find(item => item.id === assignment.subjectId);
  if (!teacher || !assignment || !schoolClass || !subject) return null;
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const report = generateMonthlyClassReport({ teacher, schoolClass, subject, students: state.students.filter(item => item.classId === schoolClass.id && item.status === "ACTIVE"), sessions: state.attendanceSessions.filter(item => item.classId === schoolClass.id && item.teacherId === teacherId), records: state.attendanceRecords, month });
  const pdf = () => void renderMonthlyAttendancePdf(report).then(file => file.save(`Xaadir-${schoolClass.name}-${month}.pdf`));
  const excel = () => void import("xlsx").then(XLSX => { const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(report.studentRows), "Attendance"); XLSX.writeFile(workbook, `Xaadir-${schoolClass.name}-${month}.xlsx`); });
  const submit = () => { const message = sendMessage({ recipientUserId: "user-admin", recipientName: "School Administrator", body: `${schoolClass.name} ${subject.name} monthly report submitted.`, attachment: { type: "MONTHLY_REPORT", entityId: assignment.id, assignmentId: assignment.id, teacherId, classId: schoolClass.id, subjectId: subject.id, month, label: `${schoolClass.name} · ${subject.name} · ${monthLabel}` } }); completeReportRequest({ teacherId, assignmentId: assignment.id, month, reportSubmissionId: message.id, responseMessageId: message.id }); setSubmitted(true); };
  return <div className={styles.pageStack}><header className={styles.pageHeader}><div><span className={styles.eyebrow}>Teacher workspace</span><h1>Monthly Reports</h1><p>Review and share monthly attendance reports with your school administrator.</p></div><div className={styles.reportControls}><select aria-label="Class and subject" value={assignment.id} onChange={event => setSelectedAssignmentId(event.target.value)}>{assignments.map(item => <option key={item.id} value={item.id}>{state.classes.find(candidate => candidate.id === item.classId)?.name} · {state.subjects.find(candidate => candidate.id === item.subjectId)?.name}</option>)}</select><input aria-label="Report month" type="month" value={month} onChange={event => setMonth(event.target.value)} /></div></header><section className={styles.reportHero}><div><span className={styles.eyebrow}>Attendance report</span><h2>{schoolClass.name}</h2><p>{subject.name} · {monthLabel} · {teacher.fullName}</p></div><div className={styles.reportActions}><button className={styles.secondaryButton} onClick={pdf}><FileText /> Download PDF</button><button className={styles.primaryButton} onClick={excel}><FileSpreadsheet /> Download Excel</button><button className={styles.secondaryButton} onClick={submit} disabled={submitted}><Send /> {submitted ? "Submitted ✓" : "Submit to Admin"}</button></div></section><section className={styles.reportMetrics}><div><span>Students</span><strong>{report.students.length}</strong></div><div><span>Sessions</span><strong>{report.sessionCount}</strong></div><div><span>Average</span><strong>{report.averageAttendance.toFixed(1)}%</strong></div></section></div>;
}
