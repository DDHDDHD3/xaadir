import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { TeacherAttendanceHistoryItem } from "./types";
import styles from "./teacher.module.css";
import { PageIntro } from "./TeacherClasses";

export function TeacherAttendanceHistory({ history }: { history: TeacherAttendanceHistoryItem[] }) {
  const present = history.filter((item) => item.status !== "MISSED").length;
  const late = history.filter((item) => item.status === "LATE").length;
  const missed = history.filter((item) => item.status === "MISSED").length;
  const rate = history.length ? Math.round((present / history.length) * 100) : 100;
  return <div className={styles.pageStack}><PageIntro title="My Attendance" copy="Your personal session check-in history. Only you and school administrators can view this record." />
    <section className={styles.metricGrid}><HistoryMetric label="Present" value={present} /><HistoryMetric label="Late" value={late} /><HistoryMetric label="Missed Sessions" value={missed} /><HistoryMetric label="Attendance" value={`${rate}%`} featured /></section>
    <section className={`${styles.panel} ${styles.historyPanel}`}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>This month</span><h2>Session history</h2></div></div>
      <div className={styles.historyList}>{history.map((item) => <article key={item.id}>
        <span className={item.status === "MISSED" ? styles.historyMissed : styles.historyPresent}>{item.status === "MISSED" ? <XCircle /> : <CheckCircle2 />}</span>
        <div><strong>{item.schoolClass?.name ?? "Assigned class"}</strong><small>{item.subject?.name ?? "Teaching session"}</small></div>
        <span><Clock3 />{item.session?.startTime ?? "—"}</span><time>{item.checkedInAt ? `Checked in ${formatTime(item.checkedInAt)}` : "Missed"}</time>
      </article>)}{!history.length && <p className={styles.emptyCopy}>No check-in history yet.</p>}</div>
    </section>
  </div>;
}

function HistoryMetric({ label, value, featured = false }: { label: string; value: string | number; featured?: boolean }) { return <article className={`${styles.metric} ${featured ? styles.metricFeatured : ""}`}><span>{label}</span><strong>{value}</strong><small>This month</small></article>; }
function formatTime(value: string) { const part = value.includes("T") ? value.split("T")[1] : value; return part?.slice(0, 5) ?? value; }
