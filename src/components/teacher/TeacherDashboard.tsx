"use client";

import { ArrowRight, Check, Clock3, MapPin, Users } from "lucide-react";
import { InitialAvatar } from "@/components/admin/AdminUI";
import type { ScheduleSession, TeacherCheckIn, TeacherWorkSession } from "@/lib/models";
import type { TeacherViewModel } from "./types";
import styles from "./teacher.module.css";

interface TeacherDashboardProps {
  model: TeacherViewModel;
  nextSession?: ScheduleSession;
  nextClassName?: string;
  nextSubjectName?: string;
  nextStudentCount?: number;
  checkIn?: TeacherCheckIn;
  workSession?: TeacherWorkSession | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onTakeAttendance: () => void;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function TeacherDashboard({
  model,
  nextSession,
  nextClassName = "Assigned class",
  nextSubjectName = "Scheduled lesson",
  nextStudentCount = 0,
  checkIn,
  workSession,
  onCheckIn,
  onCheckOut,
  onTakeAttendance,
}: TeacherDashboardProps) {
  const completed = model.todaySessions.filter((session) =>
    model.checkIns.some((item) => item.scheduleSessionId === session.id),
  ).length;
  const totalStudents = new Set(model.classes.flatMap((item) => item.students.map((student) => student.id))).size;
  const rate = model.todaySessions.length ? Math.round((completed / model.todaySessions.length) * 100) : 100;

  return (
    <div className={styles.pageStack}>
      <header className={styles.pageHeader}><InitialAvatar name={model.teacher.fullName} image={model.teacher.profileImage} large />
        <div>
          <span className={styles.eyebrow}>Teacher workspace</span>
          <h1>Good morning, {firstName(model.teacher.fullName)}</h1>
          <p>Here is your teaching day at a glance.</p>
        </div>
        <time className={styles.datePill} dateTime="2026-09-12">Saturday, 12 September</time>
      </header>

      <section className={styles.metricGrid} aria-label="Today’s overview">
        <Metric label="Today’s Classes" value={model.todaySessions.length} detail="On your schedule" />
        <Metric label="Students Today" value={totalStudents} detail="Across assigned classes" />
        <Metric label="Sessions Completed" value={completed} detail={`${Math.max(0, model.todaySessions.length - completed)} remaining`} />
        <Metric label="My Attendance" value={`${rate}%`} detail="Today’s check-ins" featured />
      </section>
      <section className={`${styles.panel} ${styles.workAttendance}`}><div><span className={styles.eyebrow}>Today&apos;s attendance</span><h2>{workSession?.status === "CHECKED_IN" ? "Checked in" : workSession?.status === "CHECKED_OUT" ? "Checked out" : "Not checked in"}</h2><p>{workSession?.checkInTime ? `Since ${new Date(workSession.checkInTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Start your work session when you arrive."}</p></div>{workSession?.status === "CHECKED_IN" ? <button className={styles.secondaryButton} onClick={onCheckOut}>Check Out</button> : workSession?.status === "CHECKED_OUT" ? <span className={styles.readyBadge}>Completed</span> : <button className={styles.primaryButton} onClick={onCheckIn}><Check /> Check In</button>}</section>

      <section className={styles.dashboardColumns}>
        <article className={`${styles.panel} ${styles.nextClass}`}>
          <div className={styles.panelHeading}>
            <div><span className={styles.eyebrow}>Next class</span><h2>{nextSubjectName}</h2></div>
            <span className={styles.liveDot}>Today</span>
          </div>
          {nextSession ? (
            <>
              <div className={styles.classHero}>
                <strong>{nextClassName}</strong>
                <div className={styles.classFacts}>
                  <span><Clock3 />{nextSession.startTime} – {nextSession.endTime}</span>
                  <span><Users />{nextStudentCount} students</span>
                  {"room" in nextSession && nextSession.room ? <span><MapPin />{String(nextSession.room)}</span> : null}
                </div>
              </div>
              {checkIn ? (
                <div className={styles.checkedInState} role="status">
                  <span className={styles.successIcon}><Check /></span>
                  <div><strong>Checked in</strong><small>Ready to record the class attendance.</small></div>
                  <button className={styles.primaryButton} onClick={onTakeAttendance}>Take Student Attendance <ArrowRight /></button>
                </div>
              ) : (
                <button className={styles.primaryButton} onClick={onCheckIn}><Check /> Check In</button>
              )}
            </>
          ) : <p className={styles.emptyCopy}>No more classes are scheduled today.</p>}
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeading}><div><span className={styles.eyebrow}>Schedule</span><h2>Today’s classes</h2></div></div>
          <div className={styles.timeline}>
            {model.todaySessions.map((session, index) => {
              const classInfo = model.classes.find((item) => item.schoolClass.id === session.classId);
              return <div className={styles.timelineRow} key={session.id}>
                <span className={styles.timelineTime}>{session.startTime}</span>
                <span className={styles.timelineMarker} data-complete={index < completed} />
                <div><strong>{classInfo?.subject.name ?? "Lesson"}</strong><small>{classInfo?.schoolClass.name ?? "Assigned class"} · {session.endTime}</small></div>
              </div>;
            })}
            {!model.todaySessions.length && <p className={styles.emptyCopy}>Your day is clear.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}

function Metric({ label, value, detail, featured = false }: { label: string; value: number | string; detail: string; featured?: boolean }) {
  return <article className={`${styles.metric} ${featured ? styles.metricFeatured : ""}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}
