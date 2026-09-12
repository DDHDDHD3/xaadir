"use client";

import { BookOpenCheck, ChevronDown, CircleHelp, Mail } from "lucide-react";
import { useState } from "react";
import styles from "./teacher.module.css";
import { PageIntro } from "./TeacherClasses";

const questions = [
  ["How do I take student attendance?", "Check into the scheduled session, open its fixed class roster, then change only absent, late or excused students before submitting."],
  ["Can I add a student to my class?", "No. Student records and class membership are managed by your school administrator."],
  ["What if I checked in late?", "Xaadir records the check-in time automatically. If a correction is needed, contact your school administrator."],
];

export function TeacherHelp() {
  const [open, setOpen] = useState(0);
  return <div className={styles.pageStack}><PageIntro title="Help" copy="Quick guidance for check-ins, rosters and attendance." />
    <section className={styles.helpGrid}><article className={`${styles.panel} ${styles.helpIntro}`}><CircleHelp /><h2>Need a hand?</h2><p>Start with these common questions or contact your school administrator.</p><a href="mailto:admin@xaadir.school"><Mail /> Contact administrator</a></article>
      <article className={`${styles.panel} ${styles.faqPanel}`}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>Guides</span><h2>Frequently asked questions</h2></div><BookOpenCheck /></div>{questions.map(([question, answer], index) => <div className={styles.faq} key={question}><button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>{question}<ChevronDown /></button>{open === index && <p>{answer}</p>}</div>)}</article></section>
  </div>;
}
