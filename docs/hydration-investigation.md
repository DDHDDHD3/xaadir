# Hydration investigation

## Result

The reported `vq-enabled="true"` and `vq_images="clean"` attributes are not produced by Xaadir. They are injected onto the root `<html>` element by a browser extension before React hydrates the document.

## Evidence

- A repository-wide search (excluding dependencies and generated `.next` output) found no `vq-enabled` or `vq_images` references.
- The same audit checked rendered code for `Date.now()`, `Math.random()`, server/client `typeof window` markup branches, and locale-sensitive date rendering. No nondeterministic initial markup was found. The admin UI's date formatter uses an explicit UTC date and timezone, producing the same output on server and client.
- Clean headless Chrome, a private/incognito context, and an extensions-disabled context were checked at `http://localhost:3001/`. None contained either `vq` attribute and none emitted an application hydration warning.
- The server-owned root layout renders deterministic `<html lang="en"><body>…</body></html>` markup. Interactive state is initialized from fixed mock data.

## Decision

No application restructuring and no `suppressHydrationWarning` were added. Suppression would hide evidence without correcting the external DOM mutation. Xaadir should remain warning-free in a clean browser context; disable the injecting extension for local development if the warning reappears.

Repository timestamps used by check-in and attendance are only created in explicit client-side mutation handlers after hydration. They are not part of the server or initial client render.
