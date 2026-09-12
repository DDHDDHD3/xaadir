"use client";

import { BookOpen, CalendarDays, Eye, MoreHorizontal, Pencil, Plus, Trash2, UserRoundCheck, UsersRound } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useXaadirData } from "@/components/providers";
import type { CreateTeacherInput, Teacher, Weekday } from "@/lib/models";
import {
  ConfirmDialog, Drawer, EmptyState, Field, FormSection, FormShell, InitialAvatar,
  OperationNotice, PageHeader, PrimaryButton, SearchField, SecondaryButton,
  SelectField, StatusPill, SummaryCard, SummaryGrid, styles,
} from "./AdminUI";

type TeacherDraft = CreateTeacherInput & { classIds: string[]; scheduleDay: Weekday; startTime: string; endTime: string };
type Notice = { ok: boolean; message: string } | null;

const emptyDraft: TeacherDraft = {
  employeeId: "", fullName: "", email: "", phone: "", status: "ACTIVE", gender: "PREFER_NOT_TO_SAY",
  subjectIds: [], accountEmail: "", accountStatus: "INVITED", classIds: [], scheduleDay: "SATURDAY", startTime: "08:00", endTime: "08:45",
};

function teacherStatus(status: Teacher["status"]) {
  if (status === "ACTIVE") return <StatusPill tone="positive">Active</StatusPill>;
  if (status === "ON_LEAVE") return <StatusPill tone="warning">On leave</StatusPill>;
  return <StatusPill>Inactive</StatusPill>;
}

export function TeachersPage() {
  const { state, addTeacher, updateTeacher, removeTeacher, assignTeacher, removeAssignment, addScheduleSession } = useXaadirData();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<"form" | "detail" | null>(null);
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [removing, setRemoving] = useState<Teacher | null>(null);
  const [draft, setDraft] = useState<TeacherDraft>(emptyDraft);
  const [notice, setNotice] = useState<Notice>(null);

  const assignmentClassIds = (teacherId: string) => state.assignments.filter((item) => item.teacherId === teacherId).map((item) => item.classId);
  const filtered = useMemo(() => state.teachers.filter((teacher) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [teacher.fullName, teacher.employeeId, teacher.email, teacher.phone].some((value) => value.toLowerCase().includes(query));
    const matchesClass = classFilter === "ALL" || assignmentClassIds(teacher.id).includes(classFilter);
    return matchesSearch && matchesClass && (statusFilter === "ALL" || teacher.status === statusFilter);
  }), [state.teachers, state.assignments, search, classFilter, statusFilter]);

  const openAdd = () => { setSelected(null); setDraft({ ...emptyDraft, employeeId: `TCH-${String(state.teachers.length + 1).padStart(3, "0")}` }); setNotice(null); setDrawer("form"); };
  const openEdit = (teacher: Teacher) => {
    setSelected(teacher);
    setDraft({ ...teacher, classIds: assignmentClassIds(teacher.id), scheduleDay: "SATURDAY", startTime: "08:00", endTime: "08:45" });
    setNotice(null); setDrawer("form");
  };

  const saveTeacher = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.fullName.trim() || !draft.employeeId.trim() || !draft.email.trim()) { setNotice({ ok: false, message: "Name, teacher ID, and email are required." }); return; }
    const payload: CreateTeacherInput = {
      employeeId: draft.employeeId, fullName: draft.fullName, email: draft.email, phone: draft.phone,
      gender: draft.gender, status: draft.status, subjectIds: draft.subjectIds,
      accountEmail: draft.accountEmail || draft.email, accountStatus: draft.accountStatus,
    };
    const result = selected ? updateTeacher(selected.id, payload) : addTeacher(payload);
    if (!result.ok) { setNotice({ ok: false, message: result.error }); return; }
    const teacherId = result.value.id;
    const oldAssignments = state.assignments.filter((item) => item.teacherId === teacherId);
    oldAssignments.filter((item) => !draft.classIds.includes(item.classId)).forEach((item) => removeAssignment(item.id));
    const defaultSubject = draft.subjectIds[0] ?? state.subjects[0]?.id;
    if (defaultSubject) {
      draft.classIds.filter((classId) => !oldAssignments.some((item) => item.classId === classId)).forEach((classId) => assignTeacher({ teacherId, classId, subjectId: defaultSubject }));
      if (!selected && draft.classIds[0]) addScheduleSession({ teacherId, classId: draft.classIds[0], subjectId: defaultSubject, day: draft.scheduleDay, startTime: draft.startTime, endTime: draft.endTime });
    }
    setDrawer(null);
  };

  const confirmRemove = () => {
    if (!removing) return;
    const result = removeTeacher(removing.id);
    setNotice(result.ok ? { ok: true, message: `${removing.fullName} was removed.` } : { ok: false, message: result.error });
    setRemoving(null);
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Teachers" subtitle="Manage teaching staff, class assignments and schedules." actions={<><SecondaryButton>Import</SecondaryButton><PrimaryButton onClick={openAdd}><Plus /> Add Teacher</PrimaryButton></>} />
      <OperationNotice state={notice} />
      <SummaryGrid>
        <SummaryCard accent label="Total Teachers" value={state.teachers.length} note="Across the current school year" icon={<UsersRound />} />
        <SummaryCard label="Active Today" value={state.teacherCheckIns.filter((item) => item.date === "2026-09-12").length} note="Checked into a teaching session" icon={<UserRoundCheck />} />
        <SummaryCard label="Classes Assigned" value={new Set(state.assignments.map((item) => item.classId)).size} note="Classes with teaching coverage" icon={<BookOpen />} />
        <SummaryCard label="Unassigned Teachers" value={state.teachers.filter((teacher) => !state.assignments.some((item) => item.teacherId === teacher.id)).length} note="Require a class assignment" icon={<CalendarDays />} />
      </SummaryGrid>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><div><h2>Teacher Directory</h2><p>Staff profiles, subjects, and today&apos;s availability.</p></div></div>
        <div className={styles.toolbar}>
          <SearchField value={search} onChange={setSearch} placeholder="Search teachers" />
          <SelectField label="Filter by class" value={classFilter} onChange={setClassFilter}><option value="ALL">All classes</option>{state.classes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</SelectField>
          <SelectField label="Filter by status" value={statusFilter} onChange={setStatusFilter}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="INACTIVE">Inactive</option></SelectField>
        </div>
        {filtered.length === 0 ? <EmptyState title={state.teachers.length ? "No matching teachers" : "No teachers yet"} detail={state.teachers.length ? "Try a different search or filter." : "Add your first teacher to start assigning classes."} action={!state.teachers.length && <PrimaryButton onClick={openAdd}><Plus /> Add Teacher</PrimaryButton>} /> :
          <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Teacher</th><th>Teacher ID</th><th>Contact</th><th>Assigned classes</th><th>Subjects</th><th>Today</th><th>Actions</th></tr></thead><tbody>{filtered.map((teacher) => {
            const classes = state.classes.filter((item) => assignmentClassIds(teacher.id).includes(item.id));
            const subjects = state.subjects.filter((item) => teacher.subjectIds.includes(item.id));
            const checkedIn = state.teacherCheckIns.some((item) => item.teacherId === teacher.id && item.date === "2026-09-12");
            return <tr key={teacher.id}><td><div className={styles.personCell}><InitialAvatar name={teacher.fullName} /><span><strong>{teacher.fullName}</strong><small className={styles.muted}>{teacher.accountStatus.toLowerCase()}</small></span></div></td><td>{teacher.employeeId}</td><td>{teacher.email}<small className={styles.muted}>{teacher.phone}</small></td><td><div className={styles.chipRow}>{classes.length ? classes.map((item) => <span className={styles.chip} key={item.id}>{item.name}</span>) : <span className={styles.muted}>Unassigned</span>}</div></td><td>{subjects.map((item) => item.name).join(", ") || "—"}</td><td>{checkedIn ? <StatusPill tone="positive">Checked in</StatusPill> : teacherStatus(teacher.status)}</td><td><div className={styles.rowActions}><button title="View teacher" onClick={() => { setSelected(teacher); setDrawer("detail"); }}><Eye /></button><button title="Edit teacher" onClick={() => openEdit(teacher)}><Pencil /></button><button title="Remove teacher" onClick={() => setRemoving(teacher)}><Trash2 /></button><button title="More options"><MoreHorizontal /></button></div></td></tr>;
          })}</tbody></table></div>}
      </section>
      <TeacherFormDrawer open={drawer === "form"} selected={selected} draft={draft} setDraft={setDraft} classes={state.classes} subjects={state.subjects} notice={notice} onClose={() => setDrawer(null)} onSubmit={saveTeacher} />
      <TeacherDetailDrawer open={drawer === "detail"} teacher={selected} onClose={() => setDrawer(null)} state={state} onEdit={() => selected && openEdit(selected)} />
      <ConfirmDialog open={Boolean(removing)} title="Remove teacher?" detail={`${removing?.fullName ?? "This teacher"} will lose their class assignments and schedule access. This action cannot be undone.`} onCancel={() => setRemoving(null)} onConfirm={confirmRemove} />
    </div>
  );
}

function TeacherFormDrawer({ open, selected, draft, setDraft, classes, subjects, notice, onClose, onSubmit }: { open: boolean; selected: Teacher | null; draft: TeacherDraft; setDraft: (value: TeacherDraft) => void; classes: ReturnType<typeof useXaadirData>["state"]["classes"]; subjects: ReturnType<typeof useXaadirData>["state"]["subjects"]; notice: Notice; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const toggle = (key: "classIds" | "subjectIds", id: string) => setDraft({ ...draft, [key]: draft[key].includes(id) ? draft[key].filter((value) => value !== id) : [...draft[key], id] });
  return <Drawer open={open} title={selected ? "Edit teacher" : "Add teacher"} subtitle="Create a staff profile, assignments, schedule, and account." onClose={onClose} footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton type="submit" form="teacher-form">{selected ? "Save Changes" : "Add Teacher"}</PrimaryButton></>}>
    <FormShell id="teacher-form" onSubmit={onSubmit}><div><OperationNotice state={notice} />
      <FormSection title="Personal information"><Field label="Full name"><input required value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></Field><Field label="Teacher / employee ID"><input required disabled={Boolean(selected)} value={draft.employeeId} onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })} /></Field><Field label="Phone"><input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field><Field label="Email"><input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value, accountEmail: draft.accountEmail || e.target.value })} /></Field><Field label="Employment status"><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Teacher["status"] })}><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="INACTIVE">Inactive</option></select></Field><Field label="Gender"><select value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as Teacher["gender"] })}><option value="PREFER_NOT_TO_SAY">Prefer not to say</option><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="OTHER">Other</option></select></Field></FormSection>
      <FormSection title="Academic assignment" detail="Select subjects and classes. Assignments update across Xaadir immediately."><Field label="Subjects" wide><div className={styles.choiceGrid}>{subjects.map((subject) => <label className={styles.choiceCard} data-selected={draft.subjectIds.includes(subject.id)} key={subject.id}><input type="checkbox" checked={draft.subjectIds.includes(subject.id)} onChange={() => toggle("subjectIds", subject.id)} /><span><strong>{subject.name}</strong><small>{subject.code}</small></span></label>)}</div></Field><Field label="Assigned classes" wide><div className={styles.choiceGrid}>{classes.map((item) => <label className={styles.choiceCard} data-selected={draft.classIds.includes(item.id)} key={item.id}><input type="checkbox" checked={draft.classIds.includes(item.id)} onChange={() => toggle("classIds", item.id)} /><span><strong>{item.name}</strong><small>{item.grade} · Section {item.section}</small></span></label>)}</div></Field></FormSection>
      <FormSection title="Scheduling" detail="A first session is created for new teachers; schedules can be expanded later."><Field label="Teaching day"><select value={draft.scheduleDay} onChange={(e) => setDraft({ ...draft, scheduleDay: e.target.value as Weekday })}>{["SATURDAY","SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY"].map((day) => <option key={day}>{day}</option>)}</select></Field><Field label="Session time"><div style={{ display: "flex", gap: 8 }}><input type="time" value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} /><input type="time" value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} /></div></Field></FormSection>
      <FormSection title="Account"><Field label="Login email"><input type="email" value={draft.accountEmail} onChange={(e) => setDraft({ ...draft, accountEmail: e.target.value })} /></Field><Field label="Initial account status"><select value={draft.accountStatus} onChange={(e) => setDraft({ ...draft, accountStatus: e.target.value as Teacher["accountStatus"] })}><option value="INVITED">Invited</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></Field></FormSection>
    </div></FormShell>
  </Drawer>;
}

function TeacherDetailDrawer({ open, teacher, onClose, state, onEdit }: { open: boolean; teacher: Teacher | null; onClose: () => void; state: ReturnType<typeof useXaadirData>["state"]; onEdit: () => void }) {
  if (!teacher) return null;
  const assignments = state.assignments.filter((item) => item.teacherId === teacher.id);
  const sessions = state.scheduleSessions.filter((item) => item.teacherId === teacher.id);
  const checkIns = state.teacherCheckIns.filter((item) => item.teacherId === teacher.id);
  const attendance = state.attendanceSessions.filter((item) => item.teacherId === teacher.id);
  const studentIds = new Set(state.students.filter((item) => assignments.some((assignment) => assignment.classId === item.classId)).map((item) => item.id));
  return <Drawer open={open} title="Teacher profile" subtitle="Assignments, schedule, and attendance activity." onClose={onClose} footer={<PrimaryButton onClick={onEdit}><Pencil /> Edit Teacher</PrimaryButton>}>
    <div className={styles.detailHero}><InitialAvatar name={teacher.fullName} large /><div><h3>{teacher.fullName}</h3><p>{teacher.employeeId} · {teacher.email}</p>{teacherStatus(teacher.status)}</div></div>
    <div className={styles.detailStats}><div className={styles.detailStat}><strong>{checkIns.length ? "96%" : "—"}</strong><span>Attendance rate</span></div><div className={styles.detailStat}><strong>{attendance.length}</strong><span>Sessions taught</span></div><div className={styles.detailStat}><strong>{assignments.length}</strong><span>Classes assigned</span></div><div className={styles.detailStat}><strong>{studentIds.size}</strong><span>Students</span></div></div>
    <section className={styles.detailSection}><h3>Assigned classes & subjects</h3><div className={styles.detailList}>{assignments.map((item) => { const room = state.classes.find((entry) => entry.id === item.classId); const subject = state.subjects.find((entry) => entry.id === item.subjectId); return <div className={styles.detailItem} key={item.id}><span><strong>{room?.name}</strong><small>{room?.room || "Room not set"}</small></span><StatusPill tone="positive">{subject?.name}</StatusPill></div>; })}</div></section>
    <section className={styles.detailSection}><h3>Weekly schedule</h3><div className={styles.detailList}>{sessions.map((session) => <div className={styles.detailItem} key={session.id}><span><strong>{session.day[0] + session.day.slice(1).toLowerCase()}</strong><small>{state.classes.find((item) => item.id === session.classId)?.name} · {state.subjects.find((item) => item.id === session.subjectId)?.name}</small></span><span>{session.startTime}–{session.endTime}</span></div>)}</div></section>
    <section className={styles.detailSection}><h3>Recent sessions</h3><div className={styles.detailList}>{attendance.length ? attendance.slice(-4).reverse().map((item) => <div className={styles.detailItem} key={item.id}><span><strong>{state.classes.find((entry) => entry.id === item.classId)?.name}</strong><small>{item.date}</small></span><StatusPill tone="positive">Recorded</StatusPill></div>) : <span className={styles.muted}>No student attendance sessions recorded yet.</span>}</div></section>
  </Drawer>;
}
