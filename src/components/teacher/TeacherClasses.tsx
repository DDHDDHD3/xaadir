import { ArrowRight, CalendarDays, Clock3, Users } from "lucide-react";
import type { TeacherClassSummary } from "./types";
import styles from "./teacher.module.css";

export function TeacherClasses({ classes, onOpen }: { classes: TeacherClassSummary[]; onOpen: (item: TeacherClassSummary) => void }) {
  return <div className={styles.pageStack}><PageIntro title="My Classes" copy="View your assigned classes, fixed rosters and attendance history." />
    <section className={styles.classGrid}>{classes.map((item) => <article className={`${styles.panel} ${styles.classCard}`} key={`${item.schoolClass.id}-${item.subject.id}`}>
      <div className={styles.classMonogram}>{item.schoolClass.name.replace(/[^A-Za-z0-9]/g, "").slice(-2)}</div>
      <span className={styles.eyebrow}>{item.subject.name}</span><h2>{item.schoolClass.name}</h2>
      <div className={styles.classMeta}><span><Users />{item.students.length} students</span>{item.nextSession && <><span><CalendarDays />{item.nextSession.day}</span><span><Clock3 />{item.nextSession.startTime}</span></>}</div>
      <button className={styles.inlineButton} onClick={() => onOpen(item)}>Open class <ArrowRight /></button>
    </article>)}</section>
  </div>;
}

export function PageIntro({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return <header className={styles.pageHeader}><div><h1>{title}</h1><p>{copy}</p></div>{action}</header>;
}
