import { ThemePicker } from "@/components/providers/ThemeProvider";
import { InitialAvatar } from "@/components/admin/AdminUI";
import { BookOpen, Mail, Phone, ShieldCheck } from "lucide-react";
import type { TeacherViewModel } from "./types";
import styles from "./teacher.module.css";
import { PageIntro } from "./TeacherClasses";

export function TeacherProfile({ model }: { model: TeacherViewModel }) {
  return <div className={styles.pageStack}><PageIntro title="Profile" copy="Your school profile and assignments. Contact an administrator to request changes." />
    <section className={styles.profileGrid}><article className={`${styles.panel} ${styles.profileCard}`}><InitialAvatar name={model.teacher.fullName} image={model.teacher.profileImage} large /><h2>{model.teacher.fullName}</h2><p>{model.teacher.employeeId}</p><span className={styles.readOnlyPill}><ShieldCheck /> Managed by administration</span></article>
      <article className={`${styles.panel} ${styles.profileDetails}`}><h2>Contact details</h2><dl><div><dt><Mail />Email</dt><dd>{model.teacher.email}</dd></div><div><dt><Phone />Phone</dt><dd>{model.teacher.phone}</dd></div><div><dt><BookOpen />Assigned classes</dt><dd>{model.classes.map((item) => item.schoolClass.name).join(", ") || "None"}</dd></div></dl></article></section><section className={styles.panel}><ThemePicker /></section>
  </div>;
}
