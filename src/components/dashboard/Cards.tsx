import { ArrowUpRight, Check, CircleStop, Pause, Play, TrendingUp, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { members, metrics, projects } from "@/data/dashboard";
import { Avatar, Button, Card, StatusBadge } from "@/components/ui/Primitives";

export function MetricGrid() {
  return <section className="metric-grid" aria-label="Project metrics">{metrics.map((metric, index) => <article className={`metric-card ${metric.featured ? "featured" : ""} reveal`} style={{ "--delay": `${index * 30}ms` } as React.CSSProperties} key={metric.label}>
    <span className="metric-label">{metric.label}</span><span className="metric-arrow"><ArrowUpRight /></span><strong>{metric.value}</strong><small>{metric.change && <em><TrendingUp />{metric.change}</em>} {metric.detail}</small>
  </article>)}</section>;
}

export function ProjectAnalytics() {
  const bars = [
    ["S", 72, "stripe"], ["M", 82, "green"], ["T", 70, "mint"], ["W", 94, "forest"], ["T", 93, "stripe"], ["F", 69, "stripe"], ["S", 84, "stripe"],
  ] as const;
  return <Card className="analytics-card reveal"><h2>Weekly Attendance</h2><div className="analytics-chart" aria-label="Weekly school attendance">{bars.map(([day, height, tone], index) => <div className="bar-slot" key={`${day}-${index}`}>{index === 2 && <span className="chart-marker">94%</span>}<span className={`chart-bar ${tone}`} style={{ height: `${height}%`, "--bar-delay": `${index * 35}ms` } as React.CSSProperties} /><small>{day}</small></div>)}</div></Card>;
}

export function ReminderCard() {
  const [started, setStarted] = useState(false);
  return <Card className="reminder-card reveal"><h2>Next Class</h2><div><h3>Mathematics<br />Grade 8A</h3><p>Time : 10:00 am - 10:45 am</p></div><Button className="button-primary" onClick={() => setStarted(!started)}>{started ? <Check /> : <Video />} {started ? "Session Active" : "Open Session"}</Button></Card>;
}

function ProjectGlyph({ tone }: { tone: string }) {
  return <span className={`project-glyph glyph-${tone}`}><i /><i /><i /></span>;
}

export function ProjectList({ onNew }: { onNew: () => void }) {
  return <Card className="projects-card reveal"><div className="card-heading"><h2>Today&apos;s Sessions</h2><Button className="button-outline button-small" onClick={onNew}>View all</Button></div><div className="project-items">{projects.map((project) => <button type="button" key={project.id} className="project-row"><ProjectGlyph tone={project.tone} /><span><strong>{project.title}</strong><small>{project.due}</small></span></button>)}</div></Card>;
}

export function TeamCollaboration({ onAdd }: { onAdd: () => void }) {
  return <Card className="team-card reveal"><div className="card-heading"><h2>Teacher Activity</h2><Button className="button-outline button-small" onClick={onAdd}>View Teachers</Button></div><div className="team-list">{members.map((member) => <div className="team-row" key={member.id}><Avatar name={member.name} colors={member.colors} /><span><strong>{member.name}</strong><small>Working on <b>{member.task}</b></small></span><StatusBadge>{member.status}</StatusBadge></div>)}</div></Card>;
}

export function ProjectProgress() {
  return <Card className="progress-card reveal"><h2>Attendance Rate</h2><div className="gauge-wrap"><svg className="gauge" viewBox="0 0 280 160" role="img" aria-label="94 percent attendance"><defs><pattern id="progress-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="3" height="8" fill="#91a29a" /></pattern></defs><path className="gauge-bg" d="M36 134 A104 104 0 0 1 244 134" /><path className="gauge-complete" pathLength="100" d="M36 134 A104 104 0 0 1 244 134" /><path className="gauge-running" pathLength="100" d="M36 134 A104 104 0 0 1 244 134" /><path className="gauge-pending" pathLength="100" d="M36 134 A104 104 0 0 1 244 134" /></svg><div className="gauge-value"><strong>94%</strong><span>Present today</span></div></div><div className="legend"><span><i className="legend-complete" />Present</span><span><i className="legend-running" />Late</span><span><i className="legend-pending" />Absent</span></div></Card>;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function TimeTracker() {
  const [seconds, setSeconds] = useState(5048);
  const [status, setStatus] = useState<"running" | "paused" | "stopped">("running");
  useEffect(() => { if (status !== "running") return; const id = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(id); }, [status]);
  return <Card className="tracker-card reveal"><div className="topo-pattern">{Array.from({ length: 8 }, (_, i) => <span key={i} style={{ inset: `${-48 + i * 17}px` }} />)}</div><h2>School Session</h2><strong className="tracker-time">{formatTime(seconds)}</strong><div className="tracker-actions"><button type="button" className="pause-control" aria-label={status === "running" ? "Pause school clock" : "Resume school clock"} onClick={() => setStatus(status === "running" ? "paused" : "running")}>{status === "running" ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button><button type="button" className="stop-control" aria-label="End school session" onClick={() => setStatus("stopped")}><CircleStop fill="currentColor" /></button></div></Card>;
}
