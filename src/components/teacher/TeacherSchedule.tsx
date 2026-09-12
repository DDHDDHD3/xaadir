import { Clock3, MapPin } from "lucide-react";
import type { TeacherClassSummary } from "./types";
import styles from "./teacher.module.css";
import { PageIntro } from "./TeacherClasses";

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];

export function TeacherSchedule({ classes }: { classes: TeacherClassSummary[] }) {
  const sessions = classes.flatMap((item) => item.nextSession ? [{ ...item.nextSession, classSummary: item }] : []);
  return <div className={styles.pageStack}><PageIntro title="Schedule" copy="Your assigned teaching timetable for the school week." />
    <section className={`${styles.panel} ${styles.scheduleBoard}`}>{days.map((day) => {
      const daySessions = sessions.filter((session) => session.day.toLowerCase() === day.toLowerCase());
      return <div className={styles.scheduleDay} key={day}><h2>{day}</h2>{daySessions.length ? daySessions.map((session) => <article key={session.id}>
        <span>{session.startTime}</span><div><strong>{session.classSummary.subject.name}</strong><small>{session.classSummary.schoolClass.name}</small></div><span className={styles.scheduleRoom}><Clock3 />{session.endTime}{"room" in session && session.room ? <><MapPin />{String(session.room)}</> : null}</span>
      </article>) : <p>No classes</p>}</div>;
    })}</section>
  </div>;
}
