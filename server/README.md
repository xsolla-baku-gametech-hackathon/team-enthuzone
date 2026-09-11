# Player Data Ingestion Backend

Express backend that accepts player feedback and gameplay telemetry, validates and normalizes each record, and stores it in MongoDB.

## Run

Requires Node.js 20+ and MongoDB.

Registration uses a MongoDB multi-document transaction. Run MongoDB as a replica set (or use a sharded/Atlas deployment); standalone MongoDB servers do not support this guarantee.

```bash
npm install
copy .env.example .env
npm start
```

Default connection: `mongodb://127.0.0.1:27017/player_issue_intelligence`.

```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/player_issue_intelligence
CORS_ORIGINS=*
HTTP_BODY_LIMIT=1mb
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
JWT_EXPIRES_IN=15m
PASSWORD_HASH_ROUNDS=12
```

The running server always uses MongoDB. In-memory repositories exist only for isolated automated tests.

## Architecture

The codebase uses feature-first vertical slices with ports-and-adapters boundaries:

```text
src/
├── config/                         # validated environment configuration
├── infrastructure/
│   └── database/                   # MongoDB connection lifecycle
├── modules/
│   ├── feedback/
│   │   ├── domain/                 # feedback rules and factories
│   │   ├── application/            # use-case orchestration
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── memory/         # isolated test adapter
│   │   │       └── mongo/          # production adapter and model
│   │   ├── presentation/http/      # controller, routes, request schemas
│   │   ├── feedback.module.js      # feature composition
│   │   └── index.js                # feature public API
│   ├── telemetry/                  # same vertical-slice layout
│   ├── organization/               # tenant aggregate and persistence
│   ├── user/                       # organization user and persistence
│   └── auth/                       # registration, login, JWT and authorization
├── shared/
│   ├── errors/
│   ├── http/middleware/
│   └── utils/
├── app.js                          # HTTP composition root
└── server.js                       # process and database bootstrap

test/
├── integration/                    # HTTP behavior
└── unit/                           # isolated model/domain behavior
```

Dependencies point inward: HTTP handlers call application services; services use injected repository adapters; MongoDB details stay in feature infrastructure. Other modules import only from each feature's `index.js`.

## Authentication and organizations

Registering creates the organization and its first `OWNER` in one transaction:

```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName":"DarkFront Studio",
    "name":"John Doe",
    "email":"john@darkfront.com",
    "password":"StrongPassword123!"
  }'
```

Login and use the returned access token:

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@darkfront.com","password":"StrongPassword123!"}'

curl "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

JWT identity contains only `sub`, `organizationId`, and `role`. Protected tenant-aware features must take `organizationId` from `req.auth.organizationId`, never from a client body. The reusable `requireAnyRole(['OWNER', 'ADMIN'])` middleware provides the role-authorization foundation. Existing feedback and telemetry routes remain unchanged in this step.

Collections added:

- `organizations`: unique logical ID and slug, plus `ACTIVE`/`SUSPENDED` status.
- `users`: globally unique email, required organization ID, bcrypt password hash, organization role, and `ACTIVE`/`DISABLED` status.

## Feedback

Create one feedback record:

```bash
curl -X POST "http://localhost:3000/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "gameId":"darkfront",
    "source":"STEAM",