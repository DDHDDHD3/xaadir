"use client";
import { CalendarDays, ChartNoAxesCombined, CircleHelp, Settings2 } from "lucide-react";
import { PageHeader, SummaryCard, SummaryGrid, styles } from "./AdminUI";

const config = {
  calendar: { title: "Calendar", subtitle: "Keep school schedules, sessions and important dates in view.", icon: CalendarDays, cards: [["Today’s sessions", "8", "Across 6 classes"], ["Next session", "10:00", "Grade 8A · Mathematics"], ["Open slots", "3", "Available this week"]] },
  analytics: { title: "Analytics", subtitle: "Understand attendance and teaching activity across your school.", icon: ChartNoAxesCombined, cards: [["Attendance rate", "94%", "This month"], ["Present today", "1,186", "Of 1,248 students"], ["Sessions recorded", "132", "This academic year"]] },
  settings: { title: "Settings", subtitle: "Configure your school workspace and administrator preferences.", icon: Settings2, cards: [["School workspace", "Xaadir Academy", "Primary campus"], ["Academic year", "2026 / 27", "Current year"], ["Timezone", "EAT", "Africa / Mogadishu"]] },
  help: { title: "Help", subtitle: "Find guidance for managing classes, rosters and attendance.", icon: CircleHelp, cards: [["Getting started", "6 guides", "For administrators"], ["Attendance workflow", "4 steps", "Register to reports"], ["Support", "Online", "Typical reply within a day"]] },
} as const;

export function SecondaryPage({ kind }: { kind: keyof typeof config }) {
  const item = config[kind]; const Icon = item.icon;
  return <div className={styles.page}><PageHeader title={item.title} subtitle={item.subtitle} />
    <SummaryGrid>{item.cards.map(([label, value, note], index) => <SummaryCard key={label} label={label} value={value} note={note} accent={index === 0} icon={<Icon />} />)}</SummaryGrid>
    <section className={styles.placeholderPanel}><Icon /><h2>{kind === "help" ? "Everything you need to keep Xaadir moving" : `${item.title} workspace`}</h2><p>This area is ready for the next connected school workflow. Your mock school data and navigation are already wired for it.</p></section>
  </div>;
}
