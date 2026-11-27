# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: React 19 functional components with hooks (useState, useEffect). Data fetching via shared API client. Each page (Activities, Teams, Leaderboard, Workouts) handles its own loading/error/empty states with accessible alerts and status text for screen readers.
- Logic tier decision: Express routes handle validation at the API boundary, returning deliberate 4xx errors with clear messages for validation failures. Routes delegate business logic to Mongoose models and service functions.
- Data tier decision: Mongoose schemas define all validation rules (required fields, enums, refs). Models export methods for computed fields (e.g., activity points). Seed script populates test data for activities, teams, and users with realistic fitness goals.
- Activity tracking approach: Activity model references User and Team documents, stores type (run, walk, swim, bike), minutes, and computed points. POST /api/activities validates user and team existence before saving; GET returns all activities.
- Team management approach: Team model stores name, mascot, and array of User refs. POST /api/teams validates name is present and non-empty; GET returns teams with populated member details.
- Leaderboard approach: GET /api/leaderboard queries all teams, sums activity points per team, sorts descending by total, and returns with rank (1-based). No database aggregation pipeline—compute in application logic.
- Workout suggestions approach: GET /api/workouts/suggestions/:userEmail queries seeded user, finds their recent activities, determines dominant activity type or fitness goal, and returns pre-defined Workout suggestions matching that focus. Include reason field explaining why the suggestion matches the user.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — Validates Mongoose schemas define required fields (name, email, fitnessGoal for User; name, mascot, members for Team; type, user, team, minutes for Activity; focus, minutes, difficulty for Workout) and that validation errors are thrown when fields are missing.
- API command: `npm run test:api --prefix octofit-tracker/backend` — Validates routes return 400 for invalid input (missing required fields), 201 for successful POST, 200 for GET, and return data matching contract (activities with userId/teamId/type/minutes/points/occurredAt; teams with name/mascot/members; leaderboard with teamName/totalPoints/rank; suggestions with title/focus/reason).
- Frontend command: `npm test --prefix octofit-tracker/frontend` — Validates each page (Activities, Teams, Leaderboard, Workouts) renders data from API, announces loading state with role="status", shows meaningful empty state when no data, and displays error alerts accessibly when API fails.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — Compiles TypeScript to JavaScript; must succeed after all model and route implementations.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — Bundles React app with Vite; must succeed after all page implementations.
