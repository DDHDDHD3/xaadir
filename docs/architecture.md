# Xaadir frontend architecture

Xaadir currently uses a typed, in-memory data layer so frontend workflows behave realistically while remaining replaceable by a database-backed repository.

## Layers

- `src/lib/models.ts` defines the school, user, teaching assignment, schedule, teacher check-in, and student attendance domains.
- `src/lib/permissions.ts` is the single policy surface. Admin owns structural records; teachers can read assigned academic data and write only their own session check-ins and assigned-class attendance.
- `src/lib/repository.ts` contains the repository contract and in-memory implementation. Mutations validate tenancy, permissions, relationships, duplicates, class capacity, fixed rosters, and the required teacher check-in.
- `src/lib/mock-data.ts` contains deterministic, realistic seed data. Visual components should consume this layer rather than embed domain records.
- `src/lib/selectors.ts` contains reusable roster, assignment, class, schedule, and student-ID selectors.
- `src/components/providers/XaadirDataProvider.tsx` owns the repository for the current browser session and publishes its snapshot and mutation methods through `useXaadirData()`.

## Permission boundaries

Admin can create, update, and remove teachers, students, classes, assignments, and schedules. Teachers cannot modify any of those records. A teacher check-in is accepted only when the scheduled session belongs to that teacher. Attendance is accepted only after that session's check-in, for the teacher's own assignment, and only when every active student in the fixed admin-managed roster appears exactly once.

These frontend checks model product behavior, not final security. The eventual backend must repeat authorization and relationship validation close to the database for every mutation.

## Provider usage

Wrap the interactive application subtree in `XaadirDataProvider`, then call `useXaadirData()` from client components. Every mutation returns `OperationResult<T>`: successful writes update the visible session snapshot immediately; rejected writes include a stable error code and user-readable message.

The default actor is the mock admin. Teacher route shells can pass `mockActors.teacher` as `initialActor`. A real authentication layer can later replace this actor without changing form or directory components.
