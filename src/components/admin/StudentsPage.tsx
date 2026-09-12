"use client";

import { ClipboardList, Eye, FileUp, GraduationCap, Info, Pencil, Plus, Rows3, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { useXaadirData } from "@/components/providers";
import type { CreateStudentInput, Student } from "@/lib/models";
import {
  ConfirmDialog, Drawer, EmptyState, Field, FormSection, FormShell, InitialAvatar, OperationNotice,
  PageHeader, PrimaryButton, SearchField, SecondaryButton, SelectField, StatusPill, SummaryCard,
  SummaryGrid, styles,
} from "./AdminUI";

type Notice = { ok: boolean; message: string } | null;
type BulkRow = { key: string; studentId: string; fullName: string; classId: string };

const newStudent = (studentId = "", classId = ""): CreateStudentInput => ({ studentId, fullName: "", classId, section: "", guardianName: "", guardianPhone: "", status: "ACTIVE" });

export function StudentsPage() {
  const { state, addStudent, updateStudent, removeStudent } = useXaadirData();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<"form" | "detail" | "bulk" | null>(null);
  const [selected, setSelected] = useState<Student | null>(null);
  const [removing, setRemoving] = useState<Student | null>(null);
  const [draft, setDraft] = useState<CreateStudentInput>(newStudent());
  const [notice, setNotice] = useState<Notice>(null);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);

  const nextStudentId = (offset = 1) => `ST-${String(state.students.length + offset).padStart(4, "0")}`;
  const createBulkRows = () => Array.from({ length: 5 }, (_, index) => ({ key: `bulk-${state.students.length + index + 1}`, studentId: nextStudentId(index + 1), fullName: "", classId: state.classes[0]?.id ?? "" }));
  const filtered = useMemo(() => state.students.filter((student) => {
    const query = search.trim().toLowerCase();
    return (!query || student.fullName.toLowerCase().includes(query) || student.studentId.toLowerCase().includes(query)) && (classFilter === "ALL" || student.classId === classFilter);
  }), [state.students, search, classFilter]);

  const openAdd = () => { setSelected(null); setDraft(newStudent(nextStudentId(), state.classes[0]?.id)); setNotice(null); setDrawer("form"); };
  const openEdit = (student: Student) => { setSelected(student); setDraft({ studentId: student.studentId, fullName: student.fullName, classId: student.classId, section: student.section, guardianName: student.guardianName, guardianPhone: student.guardianPhone, status: student.status }); setNotice(null); setDrawer("form"); };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.fullName.trim() || !draft.classId) { setNotice({ ok: false, message: "Student name and class are required." }); return; }
    const selectedClass = state.classes.find((item) => item.id === draft.classId);
    const payload = { ...draft, section: selectedClass?.section ?? draft.section };
    const result = selected ? updateStudent(selected.id, payload) : addStudent(payload);
    if (!result.ok) { setNotice({ ok: false, message: result.error }); return; }
    setDrawer(null); setNotice({ ok: true, message: `${draft.fullName} was ${selected ? "updated" : "added"}.` });
  };
  const confirmRemove = () => {
    if (!removing) return;
    const result = removeStudent(removing.id);
    setNotice(result.ok ? { ok: true, message: `${removing.fullName} was removed from the register.` } : { ok: false, message: result.error }); setRemoving(null);
  };
  const saveBulk = () => {
    const valid = bulkRows.filter((row) => row.fullName.trim() && row.classId);
    if (!valid.length) { setNotice({ ok: false, message: "Enter at least one student name and class." }); return; }
    let failure = "";
    valid.forEach((row) => {
      const selectedClass = state.classes.find((item) => item.id === row.classId);
      const result = addStudent({ studentId: row.studentId, fullName: row.fullName, classId: row.classId, section: selectedClass?.section ?? "", status: "ACTIVE" });
      if (!result.ok) failure = result.error;
    });
    if (failure) { setNotice({ ok: false, message: failure }); return; }
    setDrawer(null); setNotice({ ok: true, message: `${valid.length} student${valid.length === 1 ? "" : "s"} added to the register.` });
  };

  return <div className={styles.page}>
    <PageHeader title="Students" subtitle="Manage student records and class enrollment." actions={<><SecondaryButton><FileUp /> Import Sheet</SecondaryButton><SecondaryButton onClick={() => { setBulkRows(createBulkRows()); setNotice(null); setDrawer("bulk"); }}><Rows3 /> Add Multiple</SecondaryButton><PrimaryButton onClick={openAdd}><Plus /> Add Student</PrimaryButton></>} />
    <OperationNotice state={notice} />
    <SummaryGrid><SummaryCard accent label="Total Students" value={state.students.length} note="Currently in the school register" icon={<GraduationCap />} /><SummaryCard label="Active Students" value={state.students.filter((item) => item.status === "ACTIVE").length} note="Available on class rosters" icon={<UserPlus />} /><SummaryCard label="Classes" value={new Set(state.students.map((item) => item.classId)).size} note="Classes with enrolled students" icon={<ClipboardList />} /><SummaryCard label="Capacity Used" value={`${Math.round((state.students.length / Math.max(1, state.classes.reduce((sum, item) => sum + item.capacity, 0))) * 100)}%`} note="Across configured class capacity" icon={<Rows3 />} /></SummaryGrid>
    <section className={`${styles.panel} ${styles.registerPanel}`}>
      <div className={styles.registerHead}><SearchField value={search} onChange={setSearch} placeholder="Search student register" /><SelectField label="Filter students by class" value={classFilter} onChange={setClassFilter}><option value="ALL">All classes</option>{state.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></div>
      {!filtered.length ? <EmptyState title={state.students.length ? "No matching students" : "No students yet"} detail={state.students.length ? "Try another name, ID, or class filter." : "Add a student or enter a paper roster in sheet mode."} /> : <div className={styles.registerTableWrap}><table className={styles.registerTable}><thead><tr><th>No.</th><th>Student ID</th><th>Student Name</th><th>Class</th><th>Section</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((student, index) => <tr key={student.id}><td>{String(index + 1).padStart(2, "0")}</td><td><strong>{student.studentId}</strong></td><td><div className={styles.personCell}><InitialAvatar name={student.fullName} /><strong>{student.fullName}</strong></div></td><td>{state.classes.find((item) => item.id === student.classId)?.name ?? "Unassigned"}</td><td>{student.section}</td><td>{student.status === "ACTIVE" ? <StatusPill tone="positive">Active</StatusPill> : <StatusPill>Inactive</StatusPill>}</td><td><div className={styles.rowActions}><button title="View student" onClick={() => { setSelected(student); setDrawer("detail"); }}><Eye /></button><button title="Edit student" onClick={() => openEdit(student)}><Pencil /></button><button title="Remove student" onClick={() => setRemoving(student)}><Trash2 /></button></div></td></tr>)}</tbody></table></div>}
    </section>
    <StudentForm open={drawer === "form"} student={selected} draft={draft} setDraft={setDraft} classes={state.classes} notice={notice} onClose={() => setDrawer(null)} onSubmit={save} />
    <StudentDetail open={drawer === "detail"} student={selected} state={state} onClose={() => setDrawer(null)} onEdit={() => selected && openEdit(selected)} />
    <BulkEntry open={drawer === "bulk"} rows={bulkRows} setRows={setBulkRows} classes={state.classes} onClose={() => setDrawer(null)} onSave={saveBulk} />
    <ConfirmDialog open={Boolean(removing)} title="Remove student?" detail={`${removing?.fullName ?? "This student"} will be removed from the fixed class roster. Existing attendance history remains intact.`} onCancel={() => setRemoving(null)} onConfirm={confirmRemove} />
  </div>;
}

function StudentForm({ open, student, draft, setDraft, classes, notice, onClose, onSubmit }: { open: boolean; student: Student | null; draft: CreateStudentInput; setDraft: (value: CreateStudentInput) => void; classes: ReturnType<typeof useXaadirData>["state"]["classes"]; notice: Notice; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Drawer open={open} title={student ? "Edit student" : "Add student"} subtitle="Keep the register concise and familiar." onClose={onClose} footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton type="submit" form="student-form">{student ? "Save Changes" : "Add Student"}</PrimaryButton></>}><FormShell id="student-form" onSubmit={onSubmit}><OperationNotice state={notice} /><FormSection title="Student record"><Field label="Student ID"><input disabled={Boolean(student)} required value={draft.studentId} onChange={(e) => setDraft({ ...draft, studentId: e.target.value })} /></Field><Field label="Full name"><input required autoFocus value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></Field><Field label="Class"><select required value={draft.classId} onChange={(e) => { const item = classes.find((entry) => entry.id === e.target.value); setDraft({ ...draft, classId: e.target.value, section: item?.section ?? "" }); }}><option value="">Select class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Section"><input readOnly value={draft.section} /></Field><Field label="Guardian name"><input value={draft.guardianName ?? ""} onChange={(e) => setDraft({ ...draft, guardianName: e.target.value })} /></Field><Field label="Guardian phone"><input type="tel" value={draft.guardianPhone ?? ""} onChange={(e) => setDraft({ ...draft, guardianPhone: e.target.value })} /></Field><Field label="Status"><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Student["status"] })}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field></FormSection></FormShell></Drawer>;
}

function StudentDetail({ open, student, state, onClose, onEdit }: { open: boolean; student: Student | null; state: ReturnType<typeof useXaadirData>["state"]; onClose: () => void; onEdit: () => void }) {
  if (!student) return null;
  const room = state.classes.find((item) => item.id === student.classId);
  const records = state.attendanceRecords.filter((item) => item.studentId === student.id);
  const present = records.filter((item) => item.status === "PRESENT").length;
  return <Drawer open={open} title="Student record" subtitle="Enrollment and attendance overview." onClose={onClose} footer={<PrimaryButton onClick={onEdit}><Pencil /> Edit Student</PrimaryButton>}><div className={styles.detailHero}><InitialAvatar name={student.fullName} large /><div><h3>{student.fullName}</h3><p>{student.studentId} · {room?.name}</p><StatusPill tone="positive">{student.status.toLowerCase()}</StatusPill></div></div><div className={styles.detailStats}><div className={styles.detailStat}><strong>{records.length ? `${Math.round(present / records.length * 100)}%` : "—"}</strong><span>Attendance</span></div><div className={styles.detailStat}><strong>{present}</strong><span>Present</span></div><div className={styles.detailStat}><strong>{records.filter((item) => item.status === "ABSENT").length}</strong><span>Absent</span></div><div className={styles.detailStat}><strong>{records.filter((item) => item.status === "LATE").length}</strong><span>Late</span></div></div><section className={styles.detailSection}><h3>Enrollment</h3><div className={styles.detailList}><div className={styles.detailItem}><span><strong>{room?.name}</strong><small>{room?.grade} · Section {room?.section}</small></span><StatusPill>{room?.room ?? "No room"}</StatusPill></div></div></section><section className={styles.detailSection}><h3>Guardian</h3><div className={styles.detailItem}><span><strong>{student.guardianName || "Not provided"}</strong><small>{student.guardianPhone || "No phone number"}</small></span></div></section></Drawer>;
}

function BulkEntry({ open, rows, setRows, classes, onClose, onSave }: { open: boolean; rows: BulkRow[]; setRows: (rows: BulkRow[]) => void; classes: ReturnType<typeof useXaadirData>["state"]["classes"]; onClose: () => void; onSave: () => void }) {
  const update = (key: string, field: keyof BulkRow, value: string) => setRows(rows.map((row) => row.key === key ? { ...row, [field]: value } : row));
  const addRow = () => setRows([...rows, { key: `bulk-${rows.length ? Number(rows.at(-1)?.key.split("-").at(-1) ?? rows.length) + 1 : 1}`, studentId: `ST-${String(rows.length + 1).padStart(4, "0")}`, fullName: "", classId: classes[0]?.id ?? "" }]);
  const handleEnter = (event: KeyboardEvent<HTMLInputElement>, index: number) => { if (event.key !== "Enter") return; event.preventDefault(); if (index === rows.length - 1) addRow(); requestAnimationFrame(() => document.querySelector<HTMLInputElement>(`[data-bulk-row="${index + 1}"]`)?.focus()); };
  return <Drawer open={open} title="Add multiple students" subtitle="Quick entry for an existing paper roster." onClose={onClose} footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={onSave}>Save Students</PrimaryButton></>}><div className={styles.sheetIntro}><Info /><span>Tab across cells. Press Enter in a student name to move to the next row; a new row is added automatically at the bottom.</span></div><div className={styles.tableWrap}><table className={styles.sheetTable}><thead><tr><th>No.</th><th>Student ID</th><th>Student Name</th><th>Class</th><th /></tr></thead><tbody>{rows.map((row, index) => <tr key={row.key}><td>{String(index + 1).padStart(2, "0")}</td><td><input aria-label={`Student ID row ${index + 1}`} value={row.studentId} onChange={(e) => update(row.key, "studentId", e.target.value)} /></td><td><input data-bulk-row={index} aria-label={`Student name row ${index + 1}`} placeholder="Enter full name" value={row.fullName} onChange={(e) => update(row.key, "fullName", e.target.value)} onKeyDown={(e) => handleEnter(e, index)} /></td><td><select aria-label={`Class row ${index + 1}`} value={row.classId} onChange={(e) => update(row.key, "classId", e.target.value)}>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td><td><button className={styles.quietButton} type="button" aria-label={`Remove row ${index + 1}`} onClick={() => setRows(rows.filter((item) => item.key !== row.key))}><Trash2 /></button></td></tr>)}</tbody></table></div><div className={styles.sheetActions}><SecondaryButton onClick={addRow}><Plus /> Add Row</SecondaryButton><span className={styles.muted}>{rows.filter((row) => row.fullName.trim()).length} ready to save</span></div></Drawer>;
}
