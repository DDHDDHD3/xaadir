<p align="center"><img src=".github/assets/xaadir-hero.svg" alt="Xaadir — Digital School Attendance, made familiar." width="100%"></p>

<p align="center"><strong>Digital attendance that feels familiar.</strong><br>Xaadir turns paper-based school attendance into a connected workspace for administrators and teachers.</p>

<p align="center"><a href="https://xaadir.vercel.app">Live Demo</a></p>

## About Xaadir

Xaadir is a digital school attendance and management platform designed around the workflows schools already know. It keeps the classroom register recognizable while giving school teams a clearer, more connected view of people, classes, attendance, and reports.

## Key experiences

**Admin workspace** — school dashboard, teacher management, student and class management, assignments, attendance oversight, analytics, calendar, and configuration screens.

**Teacher workspace** — personal dashboard, work check-in/out, assigned classes, schedules, attendance history, monthly reports, PDF reports, Excel exports, and a command/search interface.

**A familiar register** — students run vertically and instructional days run horizontally, with daily marks grouped by school week. The current fixture calendar treats Saturday–Wednesday as instructional days and Thursday–Friday as closed days; the calendar is intended to become configurable as persistence is added.

## Technology

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/) [![Vercel](https://img.shields.io/badge/deployed%20with-Vercel-black?logo=vercel)](https://vercel.com/)

- Next.js App Router and React
- TypeScript with typed school models and selectors
- Poppins typography and Lucide icons
- Local repository/state layer with PDF and Excel export tooling
- Responsive admin and teacher interfaces

## Project architecture

The application is currently a frontend prototype. App Router pages are organized by role under `src/app/admin` and `src/app/teacher`; reusable UI lives in `src/components`; typed fixture data, permissions, selectors, and report helpers live in `src/lib`. The repository and provider seams are deliberately shaped for a future persistent backend, but this repository does not claim to include a production database or production authentication yet.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The current development environment includes demo accounts for exercising the Admin and Teacher workspaces. Credentials are intentionally not published in this README.

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Screenshots

The repository currently contains no approved, repository-safe product screenshots. A clean preview can be added here once one is captured without personal desktop context, private tabs, credentials, or local debug output.

## Status

**Active prototype.** The frontend workflows and attendance experience are implemented locally. Production authentication, persistent database storage, server-side authorization, configurable school settings, and deployment hardening remain follow-up work.

## Roadmap

- Persistent production database and authentication
- Configurable school calendars, terms, holidays, and branding
- Server-enforced role permissions and attendance audit trail
- Richer administrative reporting and production notification workflows

## Development notes

This project intentionally preserves the paper-register mental model: a teacher should not have to learn an unfamiliar attendance workflow to use the digital version. Contributions should keep the separate Admin and Teacher experiences clear, preserve role boundaries, and avoid documenting demo credentials or adding claims unsupported by the implementation.

## Security

Do not commit `.env` files, provider keys, passwords, tokens, private URLs, generated reports, or `.vercel` metadata. The current demo authentication is for local/prototype use and must not be presented as secure production authentication.

## License

No license has been specified yet.
