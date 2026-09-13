# Task 2 — System-adaptive appearance

Implemented with Astra, independently of responsiveness changes in `responsive-hardening.md`, then integrated into the same release.

## Root cause

The previous theme mixed hardcoded light backgrounds, component-specific dark overrides, and global selectors targeting CSS Module class names that are renamed during compilation. Matching the root theme did not guarantee that every child surface used that theme. Several text colors could therefore resolve against the wrong background.

## Resolution

- One root mechanism: `html[data-theme]`.
- System is the default. The existing valid `xaadir-theme` manual selections are preserved because there is no reliable evidence distinguishing an intentional selection from a development value. Missing or invalid values resolve to System.
- One ThemeProvider handles preferences, live media-query changes, storage events, and native browser theme color. Blocked storage still permits system appearance.
- A self-contained script in the document head resolves appearance before content paint. React starts with deterministic markup; theme state is synchronized after hydration.
- Shared semantic tokens define page, sidebar, header, primary/elevated/input surfaces, text, borders, brand, and status colors. Components consume these directly, including CSS Modules.
- Light/dark native form controls follow `color-scheme`. Theme transitions run for 180ms only when the resolved appearance changes; reduced-motion preferences disable them.
- System/Light/Dark controls are available in Admin Preferences and Teacher Profile.
- Exported PDF/Excel formatting and uploaded images were not recolored or filtered.

## Observed browser checks

Chrome, Firefox, and WebKit checks passed for default System, manual overrides against opposite OS media preferences, reload persistence, live Light/Dark without navigation, first-animation-frame appearance, and login/logout theme retention. The route matrix checked dark surfaces and light-mode return across both roles. Representative desktop/mobile screenshots were opened for visual inspection.

An actual OS Settings switch and physical-device first-paint capture were not performed; media emulation was used. See the responsiveness report for the full verification boundary.
