"use client";

import { BookOpen, Building2, CalendarDays, Eye, Pencil, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useXaadirData } from "@/components/providers";
import type { CreateClassInput, SchoolClass } from "@/lib/models";
import {
  ConfirmDialog, Drawer, EmptyState, Field, FormSection, FormShell, InitialAvatar, OperationNotice,
  PageHeader, PrimaryButton, SecondaryButton, StatusPill, SummaryCard, SummaryGrid, styles,
} from "./AdminUI";

type AssignmentDraft = { subjectId: string; teacherId: string };
type ClassDraft = CreateClassInput & { assignments: AssignmentDraft[] };
type Notice = { ok: boolean; message: string } | null;

const blankClass = (year: string): ClassDraft => ({ name: "", grade: "", section: "A", room: "", academicYear: year, capacity: 35, assignments: [], homeroomTeacherId: undefined });

export function ClassesPage() {
  const { state, addClass, updateClass, removeClass, assignTeacher, removeAssignment } = useXaadirData();
  const [drawer, setDrawer] = useState<"form" | "detail" | null>(null);
  const [selected, setSelected] = useState<SchoolClass | null>(null);
  const [removing, setRemoving] = useState<SchoolClass | null>(null);
  const [draft, setDraft] = useState<ClassDraft>(blankClass(state.school.academicYear));
  const [notice, setNotice] = useState<Notice>(null);

  const openAdd = () => { setSelected(null); setDraft(blankClass(state.school.academicYear)); setNotice(null); setDrawer("form"); };
  const openEdit = (schoolClass: SchoolClass) => {
    setSelected(schoolClass);
    setDraft({ ...schoolClass, assignments: state.assignments.filter((item) => item.classId === schoolClass.id).map(({ subjectId, teacherId }) => ({ subjectId, teacherId })) });
    setDrawer("form"); setNotice(null);
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.grade.trim()) { setNotice({ ok: false, message: "Class name and grade are required." }); return; }
    const payload: CreateClassInput = { name: draft.name, grade: draft.grade, section: draft.section, room: draft.room, academicYear: draft.academicYear, capacity: Number(draft.capacity), homeroomTeacherId: draft.homeroomTeacherId || undefined };
    const result = selected ? updateClass(selected.id, payload) : addClass(payload);
    if (!result.ok) { setNotice({ ok: false, message: result.error }); return; }
    const classId = result.value.id;
    const old = state.assignments.filter((item) => item.classId === classId);
    old.filter((item) => !draft.assignments.some((assignment) => assignment.subjectId === item.subjectId && assignment.teacherId === item.teacherId)).forEach((item) => removeAssignment(item.id));
    draft.assignments.filter((assignment) => assignment.subjectId && assignment.teacherId && !old.some((item) => item.subjectId === assignment.subjectId && item.teacherId === assignment.teacherId)).forEach((assignment) => assignTeacher({ classId, ...assignment }));
    setDrawer(null); setNotice({ ok: true, message: `${draft.name} was ${selected ? "updated" : "created"}.` });
  };
  const confirmRemove = () => {
    if (!removing) return;
    const result = removeClass(removing.id);
    setNotice(result.ok ? { ok: true, message: `${removing.name} was removed.` } : { ok: false, message: result.error }); setRemoving(null);
  };

  return <div className={styles.page}>
    <PageHeader title="Classes" subtitle="Organize classes, students, teachers and schedules." actions={<PrimaryButton onClick={openAdd}><Plus /> Add Class</PrimaryButton>} />
    <OperationNotice state={notice} />
    <SummaryGrid><SummaryCard accent label="Total Classes" value={state.classes.length} note={`Academic year ${state.school.academicYear}`} icon={<Building2 />} /><SummaryCard label="Students Enrolled" value={state.students.length} note="Across all active classes" icon={<UsersRound />} /><SummaryCard label="Teachers Assigned" value={new Set(state.assignments.map((item) => item.teacherId)).size} note="Providing subject coverage" icon={<UserRound />} /><SummaryCard label="Sessions Today" value={state.scheduleSessions.filter((item) => item.day === "SATURDAY").length} note="Scheduled across the school" icon={<CalendarDays />} /></SummaryGrid>
    {state.classes.length === 0 ? <section className={styles.panel}><EmptyState title="No classes yet" detail="Create your first class to enroll students and assign teachers." action={<PrimaryButton onClick={openAdd}><Plus /> Add Class</PrimaryButton>} /></section> : <section className={styles.cardsGrid}>{state.classes.map((schoolClass) => {
      const students = state.students.filter((item) => item.classId === schoolClass.id);
      const assignments = state.assignments.filter((item) => item.classId === schoolClass.id);
      const teachers = state.teachers.filter((item) => assignments.some((assignment) => assignment.teacherId === item.id));
      const sessions = state.scheduleSessions.filter((item) => item.classId === schoolClass.id && item.day === "SATURDAY");
      return <article className={styles.entityCard} key={schoolClass.id}><div className={styles.entityCardTop}><div><h3>{schoolClass.name}</h3><p>{schoolClass.grade} · Section {schoolClass.section} {schoolClass.room ? `· ${schoolClass.room}` : ""}</p></div><span className={styles.entityIcon}><BookOpen /></span></div><div className={styles.entityMeta}><span><strong>{students.length}/{schoolClass.capacity}</strong>Students</span><span><strong>{teachers.length}</strong>Assigned teachers</span><span><strong>{assignments.length}</strong>Subjects covered</span><span><strong>{sessions.length}</strong>Today&apos;s sessions</span></div><div className={styles.chipRow}>{teachers.slice(0, 3).map((teacher) => <span className={styles.chip} key={teacher.id}><InitialAvatar name={teacher.fullName} />{teacher.fullName}</span>)}{!teachers.length && <span className={styles.muted}>No teachers assigned</span>}</div><footer className={styles.entityCardFooter}><StatusPill tone={students.length >= schoolClass.capacity ? "warning" : "positive"}>{students.length >= schoolClass.capacity ? "At capacity" : `${schoolClass.capacity - students.length} seats open`}</StatusPill><div className={styles.rowActions}><button title="View class" onClick={() => { setSelected(schoolClass); setDrawer("detail"); }}><Eye /></button><button title="Edit class" onClick={() => openEdit(schoolClass)}><Pencil /></button><button title="Remove class" onClick={() => setRemoving(schoolClass)}><Trash2 /></button></div></footer></article>;
    })}</section>}
    <ClassForm open={drawer === "form"} selected={selected} draft={draft} setDraft={setDraft} state={state} notice={notice} onClose={() => setDrawer(null)} onSubmit={save} />
    <ClassDetail open={drawer === "detail"} schoolClass={selected} state={state} onClose={() => setDrawer(null)} onEdit={() => selected && openEdit(selected)} />
    <ConfirmDialog open={Boolean(removing)} title="Remove class?" detail={`${removing?.name ?? "This class"} can only be removed when it has no enrolled students. Teaching assignments will also be removed.`} onCancel={() => setRemoving(null)} onConfirm={confirmRemove} />
  </div>;
}

function ClassForm({ open, selected, draft, setDraft, state, notice, onClose, onSubmit }: { open: boolean; selected: SchoolClass | null; draft: ClassDraft; setDraft: (value: ClassDraft) => void; state: ReturnType<typeof useXaadirData>["state"]; notice: Notice; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const addAssignment = () => setDraft({ ...draft, assignments: [...draft.assignments, { subjectId: state.subjects[0]?.id ?? "", teacherId: "" }] });
  const updateAssignment = (index: number, update: Partial<AssignmentDraft>) => setDraft({ ...draft, assignments: draft.assignments.map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item) });
  return <Drawer open={open} title={selected ? "Edit class" : "Add class"} subtitle="Class structure, capacity, and subject teachers." onClose={onClose} footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton type="submit" form="class-form">{selected ? "Save Changes" : "Add Class"}</PrimaryButton></>}><FormShell id="class-form" onSubmit={onSubmit}><OperationNotice state={notice} /><FormSection title="Class information"><Field label="Class name"><input required placeholder="Grade 8A" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field><Field label="Grade / level"><input required placeholder="Grade 8" value={draft.grade} onChange={(e) => setDraft({ ...draft, grade: e.target.value })} /></Field><Field label="Section"><input required value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} /></Field><Field label="Room"><input placeholder="Room 204" value={draft.room ?? ""} onChange={(e) => setDraft({ ...draft, room: e.target.value })} /></Field><Field label="Academic year"><input value={draft.academicYear} onChange={(e) => setDraft({ ...draft, academicYear: e.target.value })} /></Field><Field label="Class capacity"><input type="number" min={1} max={100} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} /></Field><Field label="Homeroom teacher" wide><select value={draft.homeroomTeacherId ?? ""} onChange={(e) => setDraft({ ...draft, homeroomTeacherId: e.target.value || undefined })}><option value="">Not assigned</option>{state.teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}</select></Field></FormSection><FormSection title="Assign teachers" detail="Connect each subject to the teacher responsible for this class."><div className={styles.fieldWide}><div className={styles.detailList}>{draft.assignments.map((assignment, index) => <div className={styles.detailItem} key={`${index}-${assignment.subjectId}`}><select aria-label={`Subject assignment ${index + 1}`} value={assignment.subjectId} onChange={(e) => updateAssignment(index, { subjectId: e.target.value })}>{state.subjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.name}</option>)}</select><select aria-label={`Teacher assignment ${index + 1}`} value={assignment.teacherId} onChange={(e) => updateAssignment(index, { teacherId: e.target.value })}><option value="">Select teacher</option>{state.teachers.filter((teacher) => !assignment.subjectId || teacher.subjectIds.includes(assignment.subjectId)).map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.fullName}</option>)}</select><button className={styles.quietButton} type="button" onClick={() => setDraft({ ...draft, assignments: draft.assignments.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div><SecondaryButton onClick={addAssignment}><Plus /> Add subject teacher</SecondaryButton></div></FormSection></FormShell></Drawer>;
}

function ClassDetail({ open, schoolClass, state, onClose, onEdit }: { open: boolean; schoolClass: SchoolClass | null; state: ReturnType<typeof useXaadirData>["state"]; onClose: () => void; onEdit: () => void }) {
  if (!schoolClass) return null;
  const students = state.students.filter((item) => item.classId === schoolClass.id);
  const assignments = state.assignments.filter((item) => item.classId === schoolClass.id);
  const schedules = state.scheduleSessions.filter((item) => item.classId === schoolClass.id);
  const sessions = state.attendanceSessions.filter((item) => item.classId === schoolClass.id);
  return <Drawer open={open} title={schoolClass.name} subtitle="Class profile, roster, and teaching plan." onClose={onClose} footer={<PrimaryButton onClick={onEdit}><Pencil /> Edit Class</PrimaryButton>}><div className={styles.detailHero}><span className={styles.entityIcon}><BookOpen /></span><div><h3>{schoolClass.grade} · Section {schoolClass.section}</h3><p>{schoolClass.room || "Room not set"} · Academic year {schoolClass.academicYear}</p><StatusPill tone="positive">{students.length}/{schoolClass.capacity} students</StatusPill></div></div><div className={styles.detailStats}><div className={styles.detailStat}><strong>{students.length}</strong><span>Students</span></div><div className={styles.detailStat}><strong>{assignments.length}</strong><span>Subjects</span></div><div className={styles.detailStat}><strong>{new Set(assignments.map((item) => item.teacherId)).size}</strong><span>Teachers</span></div><div className={styles.detailStat}><strong>{sessions.length}</strong><span>Attendance sessions</span></div></div><section className={styles.detailSection}><h3>Assigned teachers</h3><div className={styles.detailList}>{assignments.map((assignment) => { const teacher = state.teachers.find((item) => item.id === assignment.teacherId); const subject = state.subjects.find((item) => item.id === assignment.subjectId); return <div className={styles.detailItem} key={assignment.id}><div className={styles.personCell}><InitialAvatar name={teacher?.fullName ?? "Teacher"} /><span><strong>{teacher?.fullName}</strong><small>{subject?.name}</small></span></div><StatusPill>{teacher?.employeeId}</StatusPill></div>; })}</div></section><section className={styles.detailSection}><h3>Student roster</h3><div className={styles.detailList}>{students.slice(0, 8).map((student, index) => <div className={styles.detailItem} key={student.id}><span><strong>{String(index + 1).padStart(2, "0")} · {student.fullName}</strong><small>{student.studentId}</small></span><StatusPill tone="positive">Active</StatusPill></div>)}</div></section><section className={styles.detailSection}><h3>Weekly timetable</h3><div className={styles.detailList}>{schedules.map((session) => <div className={styles.detailItem} key={session.id}><span><strong>{session.day[0] + session.day.slice(1).toLowerCase()}</strong><small>{state.subjects.find((item) => item.id === session.subjectId)?.name}</small></span><span>{session.startTime}–{session.endTime}</span></div>)}</div></section></Drawer>;
}
