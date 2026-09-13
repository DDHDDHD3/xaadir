"use client";

import { BookOpen, CalendarDays, Eye, MoreHorizontal, Pencil, Plus, Trash2, UserRoundCheck, UsersRound } from "lucide-react";
import { useState, type Dispatch, type SetStateAction, type FormEvent } from "react";
import { useXaadirData } from "@/components/providers";
import { processProfileImage, PROFILE_IMAGE_ERROR } from "@/lib/profile-image";
import type { CreateTeacherInput, Teacher, Weekday } from "@/lib/models";
import {
  ConfirmDialog, Drawer, EmptyState, Field, FormSection, FormShell, InitialAvatar,
  OperationNotice, PageHeader, PrimaryButton, SearchField, SecondaryButton,
  SelectField, StatusPill, SummaryCard, SummaryGrid, styles,
} from "./AdminUI";

type TeacherDraft = CreateTeacherInput & { classIds: string[]; scheduleDay: Weekday; startTime: string; endTime: string; password: string; confirmPassword: string };
type Notice = { ok: boolean; message: string } | null;

const emptyDraft: TeacherDraft = {
  employeeId: "", fullName: "", email: "", phone: "", status: "ACTIVE", gender: "PREFER_NOT_TO_SAY",
  subjectIds: [], accountEmail: "", accountStatus: "ACTIVE", classIds: [], scheduleDay: "SATURDAY", startTime: "08:00", endTime: "08:45", password: "", confirmPassword: "", profileImage: "",
};

function teacherStatus(status: Teacher["status"]) {
  if (status === "ACTIVE") return <StatusPill tone="positive">Active</StatusPill>;
  if (status === "ON_LEAVE") return <StatusPill tone="warning">On leave</StatusPill>;
  return <StatusPill>Inactive</StatusPill>;
}

export function TeachersPage() {
  const { state, addTeacher, updateTeacher, updateAccount, removeTeacher, assignTeacher, removeAssignment } = useXaadirData();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<"form" | "detail" | null>(null);
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [removing, setRemoving] = useState<Teacher | null>(null);
  const [draft, setDraft] = useState<TeacherDraft>(emptyDraft);
  const [notice, setNotice] = useState<Notice>(null);

  const assignmentClassIds = (teacherId: string) => state.assignments.filter((item) => item.teacherId === teacherId).map((item) => item.classId);
  const filtered = state.teachers.filter((teacher) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [teacher.fullName, teacher.employeeId, teacher.email, teacher.phone].some((value) => value.toLowerCase().includes(query));
    const matchesClass = classFilter === "ALL" || assignmentClassIds(teacher.id).includes(classFilter);
    return matchesSearch && matchesClass && (statusFilter === "ALL" || teacher.status === statusFilter);
  });

  const openAdd = () => { setSelected(null); setDraft({ ...emptyDraft, employeeId: `TCH-${String(state.teachers.length + 1).padStart(3, "0")}` }); setNotice(null); setDrawer("form"); };
  const openEdit = (teacher: Teacher) => {
    setSelected(teacher);
    setDraft({ ...teacher, accountStatus: state.accounts.find((account) => account.teacherId === teacher.id)?.status === "INACTIVE" ? "SUSPENDED" : "ACTIVE", password: "", confirmPassword: "", classIds: assignmentClassIds(teacher.id), scheduleDay: "SATURDAY", startTime: "08:00", endTime: "08:45" });
    setNotice(null); setDrawer("form");
  };

  const saveTeacher = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.fullName.trim() || !draft.employeeId.trim() || !draft.email.trim()) { setNotice({ ok: false, message: "Name, teacher ID, and email are required." }); return; }
    if ((!selected || draft.password) && (draft.password.length < 8 || draft.password !== draft.confirmPassword)) { setNotice({ ok: false, message: "Enter matching passwords of at least 8 characters." }); return; }
    const payload: CreateTeacherInput = {
      employeeId: draft.employeeId, fullName: draft.fullName, email: draft.email, phone: draft.phone,
      gender: draft.gender, status: draft.status, subjectIds: draft.subjectIds,
      accountEmail: draft.accountEmail || draft.email, accountStatus: draft.accountStatus,
      password: draft.password, profileImage: draft.profileImage,
      ...(!selected ? { classIds: draft.classIds, scheduleDay: draft.scheduleDay, startTime: draft.startTime, endTime: draft.endTime } : {}),
    };
    const result = selected ? updateTeacher(selected.id, payload) : addTeacher(payload);
    if (!result.ok) { setNotice({ ok: false, message: result.error }); return; }
    const teacherId = result.value.id;
    if (!selected) { setNotice(null); setDrawer(null); return; }
    const oldAssignments = state.assignments.filter((item) => item.teacherId === teacherId);
    oldAssignments.filter((item) => !draft.classIds.includes(item.classId)).forEach((item) => removeAssignment(item.id));
    const defaultSubject = draft.subjectIds[0] ?? state.subjects[0]?.id;
    if (defaultSubject) {
      draft.classIds.filter((classId) => !oldAssignments.some((item) => item.classId === classId)).forEach((classId) => assignTeacher({ teacherId, classId, subjectId: defaultSubject }));
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
            return <tr key={teacher.id}><td><div className={styles.personCell}><InitialAvatar image={teacher.profileImage} name={teacher.fullName} /><span><strong>{teacher.fullName}</strong><small className={styles.muted}>{state.accounts.find((account) => account.teacherId === teacher.id)?.status.toLowerCase() ?? "inactive"}</small></span></div></td><td>{teacher.employeeId}</td><td>{teacher.email}<small className={styles.muted}>{teacher.phone}</small></td><td><div className={styles.chipRow}>{classes.length ? classes.map((item) => <span className={styles.chip} key={item.id}>{item.name}</span>) : <span className={styles.muted}>Unassigned</span>}</div></td><td>{subjects.map((item) => item.name).join(", ") || "—"}</td><td>{checkedIn ? <StatusPill tone="positive">Checked in</StatusPill> : teacherStatus(teacher.status)}</td><td><div className={styles.rowActions}><button title="View teacher" onClick={() => { setSelected(teacher); setDrawer("detail"); }}><Eye /></button><button title="Edit teacher" onClick={() => openEdit(teacher)}><Pencil /></button><button title="Remove teacher" onClick={() => setRemoving(teacher)}><Trash2 /></button><button title="More options"><MoreHorizontal /></button></div></td></tr>;
          })}</tbody></table></div>}
      </section>
      <TeacherFormDrawer key={`${drawer}-${selected?.id ?? "new"}`} open={drawer === "form"} selected={selected} draft={draft} setDraft={setDraft} classes={state.classes} subjects={state.subjects} notice={notice} onClose={() => setDrawer(null)} onSubmit={saveTeacher} />
      <TeacherDetailDrawer open={drawer === "detail"} teacher={selected} onClose={() => setDrawer(null)} state={state} onEdit={() => selected && openEdit(selected)} updateAccount={updateAccount} />
      <ConfirmDialog open={Boolean(removing)} title="Remove teacher?" detail={`${removing?.fullName ?? "This teacher"} will lose their class assignments and schedule access. This action cannot be undone.`} onCancel={() => setRemoving(null)} onConfirm={confirmRemove} />
    </div>
  );
}

function TeacherFormDrawer({ open, selected, draft, setDraft, classes, subjects, notice, onClose, onSubmit }: { open: boolean; selected: Teacher | null; draft: TeacherDraft; setDraft: Dispatch<SetStateAction<TeacherDraft>>; classes: ReturnType<typeof useXaadirData>["state"]["classes"]; subjects: ReturnType<typeof useXaadirData>["state"]["subjects"]; notice: Notice; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toggle = (key: "classIds" | "subjectIds", id: string) => setDraft({ ...draft, [key]: draft[key].includes(id) ? draft[key].filter((value) => value !== id) : [...draft[key], id] });
  const advance = () => {
    const form = document.getElementById("teacher-form") as HTMLFormElement;
    if (!form.reportValidity()) return;
    if (step === 1 && draft.classIds.length && (!draft.subjectIds.length || draft.startTime >= draft.endTime)) { setFormError("Choose a subject and an end time after the start time."); return; }
    if (step === 2 && ((!selected || draft.password) && (draft.password.length < 8 || draft.password !== draft.confirmPassword))) { setFormError("Enter matching passwords of at least 8 characters."); return; }
    setFormError(""); setStep(step + 1);
  };
  return <Drawer centered open={open} title={selected ? "Edit teacher" : "Add teacher"} subtitle="Create a staff profile, assignments, schedule, and account." steps={<ol className={styles.teacherSteps}>{["Profile", "Assignments", "Account", "Review"].map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined}>{index + 1}. {label}</li>)}</ol>} onClose={onClose} footer={<><SecondaryButton onClick={step ? () => { setFormError(""); setStep(step - 1); } : onClose}>{step ? "Back" : "Cancel"}</SecondaryButton>{step < 3 ? <PrimaryButton key="next" disabled={processing} onClick={advance}>Next</PrimaryButton> : <PrimaryButton key="create" type="submit" form="teacher-form">{selected ? "Save Changes" : "Create Teacher"}</PrimaryButton>}</>}>
    <FormShell id="teacher-form" onSubmit={(event) => { if (step < 3) { event.preventDefault(); advance(); } else onSubmit(event); }}><OperationNotice state={notice} /><OperationNotice state={formError ? { ok: false, message: formError } : null} />
      {step === 0 && <><FormSection title="Personal information"><div className={styles.fieldWide}><div className={styles.photoUpload}><InitialAvatar name={draft.fullName || "Teacher"} image={draft.profileImage} large /><label className={styles.secondaryButton}>Upload Photo<input className={styles.srOnly} aria-label="Upload Photo" type="file" accept="image/png,image/jpeg,image/webp" disabled={processing} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setProcessing(true); setFormError(""); try { const profileImage = await processProfileImage(file); setDraft((current) => ({ ...current, profileImage })); } catch { setFormError(PROFILE_IMAGE_ERROR); } finally { setProcessing(false); event.target.value = ""; } }} /></label><small>{processing ? "Processing photo…" : "PNG, JPG or WEBP · Max 2 MB"}</small></div></div><Field label="Full name"><input required value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></Field><Field label="Teacher / employee ID"><input required disabled={Boolean(selected)} value={draft.employeeId} onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })} /></Field><Field label="Phone"><input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field><Field label="Email"><input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value, accountEmail: draft.accountEmail || e.target.value })} /></Field><Field label="Employment status"><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Teacher["status"] })}><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="INACTIVE">Inactive</option></select></Field><Field label="Gender"><select value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as Teacher["gender"] })}><option value="PREFER_NOT_TO_SAY">Prefer not to say</option><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="OTHER">Other</option></select></Field></FormSection>
</>}
      {step === 1 && <><FormSection title="Academic assignment" detail="Select subjects and classes. Assignments update across Xaadir immediately."><Field label="Subjects" wide><div className={styles.choiceGrid}>{subjects.map((subject) => <label className={styles.choiceCard} data-selected={draft.subjectIds.includes(subject.id)} key={subject.id}><input type="checkbox" aria-label={subject.name} checked={draft.subjectIds.includes(subject.id)} onChange={() => toggle("subjectIds", subject.id)} /><span><strong>{subject.name}</strong><small>{subject.code}</small></span></label>)}</div></Field><Field label="Assigned classes" wide><div className={styles.choiceGrid}>{classes.map((item) => <label className={styles.choiceCard} data-selected={draft.classIds.includes(item.id)} key={item.id}><input type="checkbox" aria-label={item.name} checked={draft.classIds.includes(item.id)} onChange={() => toggle("classIds", item.id)} /><span><strong>{item.name}</strong><small>{item.grade} · Section {item.section}</small></span></label>)}</div></Field></FormSection>
      <FormSection title="Scheduling" detail="A first session is created for new teachers; schedules can be expanded later."><Field label="Teaching day"><select value={draft.scheduleDay} onChange={(e) => setDraft({ ...draft, scheduleDay: e.target.value as Weekday })}>{["SATURDAY","SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY"].map((day) => <option key={day}>{day}</option>)}</select></Field><Field label="Session time"><div style={{ display: "flex", gap: 8 }}><input type="time" value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} /><input type="time" value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} /></div></Field></FormSection>
</>}
      {step === 2 && <><FormSection title="Account"><Field label="Login email"><input required type="email" value={draft.accountEmail} onChange={(e) => setDraft({ ...draft, accountEmail: e.target.value })} /></Field><Field label="Password"><input required={!selected} type={showPassword ? "text" : "password"} minLength={8} value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} /></Field><Field label="Confirm password"><input required={!selected || Boolean(draft.password)} type={showPassword ? "text" : "password"} value={draft.confirmPassword} onChange={(e) => setDraft({ ...draft, confirmPassword: e.target.value })} /></Field><Field label="Initial account status"><select value={draft.accountStatus} onChange={(e) => setDraft({ ...draft, accountStatus: e.target.value as Teacher["accountStatus"] })}><option value="ACTIVE">Active</option><option value="SUSPENDED">Inactive</option></select></Field></FormSection>
<div className={styles.passwordActions}><SecondaryButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"} Password</SecondaryButton><SecondaryButton onClick={() => { const password = `Xaadir#${crypto.randomUUID().slice(0, 12)}`; setDraft({ ...draft, password, confirmPassword: password }); setShowPassword(true); }}>Generate Password</SecondaryButton></div></>}
      {step === 3 && <section className={styles.review}><div className={styles.detailHero}><InitialAvatar name={draft.fullName} image={draft.profileImage} large /><div><h3>{draft.fullName}</h3><p>{draft.employeeId}</p></div></div><h3>Profile</h3><p>{draft.email}</p><p>{draft.phone || "No phone provided"}</p><h3>Assignments</h3><p>{classes.filter((item) => draft.classIds.includes(item.id)).map((item) => item.name).join(", ") || "Unassigned"}</p><p>{subjects.filter((item) => draft.subjectIds.includes(item.id)).map((item) => item.name).join(", ")}</p>{draft.classIds.length > 0 && <p>{draft.scheduleDay} · {draft.startTime}–{draft.endTime}</p>}<h3>Account</h3><p>{draft.accountEmail}</p><StatusPill tone={draft.accountStatus === "ACTIVE" ? "positive" : "neutral"}>{draft.accountStatus === "ACTIVE" ? "Active" : "Inactive"}</StatusPill></section>}
    </FormShell>
  </Drawer>;
}

function TeacherDetailDrawer({ open, teacher, onClose, state, onEdit, updateAccount }: { open: boolean; teacher: Teacher | null; onClose: () => void; state: ReturnType<typeof useXaadirData>["state"]; onEdit: () => void; updateAccount: ReturnType<typeof useXaadirData>["updateAccount"] }) {
  const [deactivateOpen, setDeactivateOpen] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [resetOpen, setResetOpen] = useState(false); const [passwordError, setPasswordError] = useState(""); const [passwordSuccess, setPasswordSuccess] = useState("");
  if (!teacher) return null;
  const assignments = state.assignments.filter((item) => item.teacherId === teacher.id);
  const sessions = state.scheduleSessions.filter((item) => item.teacherId === teacher.id);
  const checkIns = state.teacherCheckIns.filter((item) => item.teacherId === teacher.id);
  const attendance = state.attendanceSessions.filter((item) => item.teacherId === teacher.id);
  const studentIds = new Set(state.students.filter((item) => assignments.some((assignment) => assignment.classId === item.classId)).map((item) => item.id));
  const account = state.accounts.find((item) => item.teacherId === teacher.id); const active = account?.status === "ACTIVE";
  const savePassword = () => { if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters."); return; } if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; } const result = updateAccount(teacher.id, { password: newPassword }); if (!result.ok) { setPasswordError(result.error); return; } setPasswordError(""); setPasswordSuccess("Password reset successfully"); setResetOpen(false); setNewPassword(""); setConfirmPassword(""); };
  const toggleAccess = () => { const result = updateAccount(teacher.id, { status: active ? "INACTIVE" : "ACTIVE" }); if (!result.ok) setPasswordError(result.error); else { setPasswordError(""); setDeactivateOpen(false); } };
  return <Drawer open={open} title="Teacher profile" subtitle="Assignments, schedule, and attendance activity." onClose={onClose} footer={<PrimaryButton onClick={onEdit}><Pencil /> Edit Teacher</PrimaryButton>}>
    <div className={styles.detailHero}><InitialAvatar image={teacher.profileImage} name={teacher.fullName} large /><div><h3>{teacher.fullName}</h3><p>{teacher.employeeId} · {teacher.email}</p>{teacherStatus(teacher.status)}</div></div>
    <div className={styles.detailStats}><div className={styles.detailStat}><strong>{checkIns.length ? "96%" : "—"}</strong><span>Attendance rate</span></div><div className={styles.detailStat}><strong>{attendance.length}</strong><span>Sessions taught</span></div><div className={styles.detailStat}><strong>{assignments.length}</strong><span>Classes assigned</span></div><div className={styles.detailStat}><strong>{studentIds.size}</strong><span>Students</span></div></div><section className={styles.detailSection}><h3>Account access</h3><div className={styles.detailItem}><span><strong>{account?.email ?? teacher.accountEmail}</strong><small>Login account</small></span><StatusPill tone={active ? "positive" : "danger"}>{active ? "Active" : "Inactive"}</StatusPill></div><div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}><button className={styles.secondaryButton} onClick={() => { setPasswordError(""); setPasswordSuccess(""); setResetOpen(true); }}>Reset Password</button><button className={active ? styles.dangerButton : styles.primaryButton} onClick={() => active ? setDeactivateOpen(true) : toggleAccess()}>{active ? "Deactivate Access" : "Reactivate Access"}</button></div>{passwordSuccess && <p className={styles.muted} role="status">{passwordSuccess}</p>}<ConfirmDialog open={deactivateOpen} title="Deactivate Teacher Access?" detail="The teacher will no longer be able to sign in. Assignments, profile and attendance history will remain unchanged." confirmLabel="Deactivate" onCancel={() => setDeactivateOpen(false)} onConfirm={toggleAccess} />{!resetOpen && passwordError && <p role="alert">{passwordError}</p>}{resetOpen && <Drawer centered open title="Reset Password" onClose={() => setResetOpen(false)} footer={<><SecondaryButton onClick={() => setResetOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={savePassword}>Reset Password</PrimaryButton></>}><Field label="New password"><input type={showPassword ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></Field><Field label="Confirm password"><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></Field>{passwordError && <p className={styles.noticeError}>{passwordError}</p>}<div className={styles.passwordActions}><SecondaryButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"} Password</SecondaryButton><SecondaryButton onClick={() => { const password = `Xaadir#${crypto.randomUUID().slice(0, 12)}`; setNewPassword(password); setConfirmPassword(password); setShowPassword(true); }}>Generate Password</SecondaryButton></div></Drawer>}</section>
    <section className={styles.detailSection}><h3>Assigned classes & subjects</h3><div className={styles.detailList}>{assignments.map((item) => { const room = state.classes.find((entry) => entry.id === item.classId); const subject = state.subjects.find((entry) => entry.id === item.subjectId); return <div className={styles.detailItem} key={item.id}><span><strong>{room?.name}</strong><small>{room?.room || "Room not set"}</small></span><StatusPill tone="positive">{subject?.name}</StatusPill></div>; })}</div></section>
    <section className={styles.detailSection}><h3>Weekly schedule</h3><div className={styles.detailList}>{sessions.map((session) => <div className={styles.detailItem} key={session.id}><span><strong>{session.day[0] + session.day.slice(1).toLowerCase()}</strong><small>{state.classes.find((item) => item.id === session.classId)?.name} · {state.subjects.find((item) => item.id === session.subjectId)?.name}</small></span><span>{session.startTime}–{session.endTime}</span></div>)}</div></section>
    <section className={styles.detailSection}><h3>Recent sessions</h3><div className={styles.detailList}>{attendance.length ? attendance.slice(-4).reverse().map((item) => <div className={styles.detailItem} key={item.id}><span><strong>{state.classes.find((entry) => entry.id === item.classId)?.name}</strong><small>{item.date}</small></span><StatusPill tone="positive">Recorded</StatusPill></div>) : <span className={styles.muted}>No student attendance sessions recorded yet.</span>}</div></section>
  </Drawer>;
}
