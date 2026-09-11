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
