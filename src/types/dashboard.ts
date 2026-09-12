export type NavId = "dashboard" | "tasks" | "calendar" | "analytics" | "team" | "settings" | "help" | "logout";
export type MemberStatus = "Completed" | "In Progress" | "Pending";

export interface Metric { label: string; value: number; detail: string; change?: number; featured?: boolean }
export interface Project { id: number; title: string; due: string; tone: string }
export interface Member { id: number; name: string; task: string; status: MemberStatus; colors: [string, string] }
