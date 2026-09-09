# PortalFi server

Multi-tenant Express/Mongoose API behind the PortalFi dashboard. Each venue
is a "tenant" - its own database on one shared Mongo connection, selected by
the username it logs in with (see `src/db/index.ts`).

## Setup

```bash
npm install
cp .env.example .env   # fill in JWT_SECRET and ALLOWED_ORIGINS - see below
npm run local-mongo    # separate terminal: an in-memory Mongo for local dev
npm run seed-user -- <venue-username> <password>
npm run serve           # tsc -w + nodemon, or: npm run build && npm start
```

## Configuration

Every value a new deployment needs to change lives in `.env` (see
`.env.example`) - nothing else in the code should need editing to point
this server at a new venue's database or frontend:

| Variable          | What it is                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `DATABASE`         | Mongo connection string, no database name (one is selected per tenant).   |
| `HTTP_PORT`        | Port for the plain HTTP listener.                                         |
| `HTTPS_PORT`        | Port for the HTTPS listener.                                              |
| `JWT_SECRET`        | Must exactly match the frontend's `JWT_SECRET`. `openssl rand -hex 48`.    |
| `ALLOWED_ORIGINS`   | Comma-separated frontend origin(s) allowed to call this API with cookies. |

## Adding a venue

A venue is just a username. `npm run seed-user -- <username> <password>`
creates its login; logging in with that username is what selects its
database (see `src/user/userController.ts`). There's no separate signup
flow by design - accounts are provisioned, not self-served.

## Content types

Food, drinks, and events are all built on one generic engine
(`src/content/contentModel.ts`, `contentController.ts`, `contentRouter.ts`).
Adding a new content type is a new file under `src/content-types/` that
defines a schema and wires the three factories together - see
`src/content-types/food.ts` for the smallest example.

## Testing

```bash
npm test
```

Runs against a real, disposable `mongodb-memory-server` instance (see
`tests/globalSetup.js`) - no external services needed.
