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