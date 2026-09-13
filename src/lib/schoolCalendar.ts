import type { Weekday } from "./models";

export interface SchoolCalendar { activeWeekdays: Weekday[]; closedWeekdays: Weekday[]; }
export const schoolCalendar: SchoolCalendar = {
  activeWeekdays: ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY"],
  closedWeekdays: ["THURSDAY", "FRIDAY"],
};

const weekdays: Weekday[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
export function weekdayForDate(date: string | Date): Weekday { const value = typeof date === "string" ? new Date(`${date}T12:00:00Z`) : date; return weekdays[value.getUTCDay()]; }
export function isSchoolDay(date: string, calendar = schoolCalendar) { return calendar.activeWeekdays.includes(weekdayForDate(date)); }
export function shiftSchoolDay(date: string, direction: 1 | -1, calendar = schoolCalendar) { const next = new Date(`${date}T12:00:00Z`); do { next.setUTCDate(next.getUTCDate() + direction); } while (!isSchoolDay(next.toISOString().slice(0, 10), calendar)); return next.toISOString().slice(0, 10); }
export function formatSchoolDate(date: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) { return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }
export function shortWeekday(date: string) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }
export function datesForSchoolWeek(date: string, calendar = schoolCalendar) { const cursor = new Date(`${date}T12:00:00Z`); while (weekdayForDate(cursor) !== calendar.activeWeekdays[0]) cursor.setUTCDate(cursor.getUTCDate() - 1); const days: string[] = []; for (let i = 0; i < 7; i += 1) { const candidate = new Date(cursor); candidate.setUTCDate(cursor.getUTCDate() + i); const iso = candidate.toISOString().slice(0, 10); if (isSchoolDay(iso, calendar)) days.push(iso); } return days; }
