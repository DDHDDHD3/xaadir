import type { Member, Metric, Project } from "@/types/dashboard";

export const metrics: Metric[] = [
  { label: "Total Students", value: 1248, change: 5, detail: "Enrolled this term", featured: true },
  { label: "Teachers", value: 48, change: 6, detail: "46 active today" },
  { label: "Classes", value: 36, change: 2, detail: "Across 8 grade levels" },
  { label: "Today's Absences", value: 18, detail: "12 registers submitted" },
];

export const projects: Project[] = [
  { id: 1, title: "Grade 8A · Mathematics", due: "10:00 – 10:45", tone: "blue" },
  { id: 2, title: "Grade 7B · English", due: "10:50 – 11:35", tone: "teal" },
  { id: 3, title: "Grade 9A · Science", due: "11:40 – 12:25", tone: "multi" },
  { id: 4, title: "Grade 8B · Geography", due: "12:30 – 01:15", tone: "amber" },
  { id: 5, title: "Grade 7A · Somali", due: "01:20 – 02:05", tone: "violet" },
];

export const members: Member[] = [
  { id: 1, name: "Ahmed Hassan", task: "Grade 8A Mathematics register", status: "Completed", colors: ["#f7a6ad", "#343b3a"] },
  { id: 2, name: "Fatima Ali", task: "Grade 7B English session", status: "In Progress", colors: ["#caf59d", "#31383b"] },
  { id: 3, name: "Mohamed Yusuf", task: "Grade 9A Science register", status: "Pending", colors: ["#b7c4fa", "#d4d7cf"] },
  { id: 4, name: "Hodan Warsame", task: "Grade 8B Geography session", status: "In Progress", colors: ["#f7dfa2", "#2f3836"] },
];
