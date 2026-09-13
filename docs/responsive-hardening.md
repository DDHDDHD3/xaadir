# Task 1 — Responsiveness and browser hardening

Implemented with Astra, separately from the theme work in `system-theme.md`.

## Persistence audit

This checkout is a frontend prototype. It contains no API routes, database adapter, or shared authentication service. The Vercel project has no configured environment variables; there are no local environment files or environment-variable consumers in the application.

| Browser storage | Contents |
| --- | --- |
| `xaadir-data` | Accounts and frontend passwords; administrator and teacher profiles/images; school settings; classes, students, subjects, assignments, schedules; attendance records |
| `xaadir-demo-session` | Current frontend login |
| `xaadir-messages` | Messages and attachment references |
| `xaadir-notifications` | Notifications and read state |
| `xaadir-report-requests` | Monthly report requests |
| `xaadir-work-session` | Teacher work check-in/out |
| `xaadir-draft-*` | Attendance drafts |
| `xaadir-theme` | Device-local appearance preference |

The seed Admin and Teacher logins remain available on fresh browsers. An account created or password changed in one browser does not appear in another browser. The same limitation applies to attendance, images, and messaging. Shared backend required — this data currently exists only in browser-local storage. No localStorage synchronization workaround was added.

## Changes

- Removed document-level overflow masking. Flexible headers keep Search, Messages, Notifications, and Profile reachable down to 320px.
- Mobile navigation scrolls within the viewport, supports Escape/focus containment, and avoids eager route prefetches that WebKit aborted when the drawer crossed responsive breakpoints.
- Search and dialogs use bounded internal scrolling; mobile controls use readable input sizes. Viewport metadata, safe-area padding, and VisualViewport dimensions support reduced visible space when keyboards open.
- Added direct Messages routes using the existing messaging component. Search respects the active role's routes and assigned classes.
- The daily register preserves its grid with sticky No./Student columns and a sticky header; weekly dates scroll independently. The profile and native month input no longer overflow tablet/small-phone layouts.
- Added focus containment/return and Escape handling for shared drawers, confirmations, search, messaging dialogs, password changes, and analytics details.
- Bundled Poppins remains the font source. Compressed uploaded avatars retain their original pixels. A bundled application icon prevents missing favicon requests.
- School-week calculations now use calendar dates in UTC and start on Saturday, avoiding host-time-zone shifts. Monthly analytics date enumeration uses the same date-safe approach.
- Chart dates can scroll within their container instead of overlapping on narrow devices.

## Verification scope

The local production matrix observed 16 role pages × 14 viewport sizes × 2 themes × 3 engines = 1,344 layout/theme combinations, with zero overflow or white-surface failures after fixes. Sizes cover every requested width plus phone landscape. Functional browser runs exercised frontend login/refresh/logout, search at reduced height, messages, dialogs, manual/system appearance, 6/30/50-student fixture registers, draft refresh, and 125%/150% CSS layout zoom.

Browser engines: installed Chrome, Playwright Firefox, and Playwright WebKit on macOS. WebKit emulation is not physical iPhone/iPad or installed Safari evidence. Physical iOS/Android keyboards, Windows/Edge, actual browser zoom UI, and native OS-setting switches remain unverified. Reduced viewport tests do not prove physical keyboard behavior.

Detailed browser results and screenshots are private generated artifacts under `output/playwright/hardening/`. Build/release results are recorded in the task's final response. Frontend passwords are deliberately absent from this document.
