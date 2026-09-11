# 📡 Core Platform Server — REST API Reference

All requests accept and return `application/json` unless otherwise specified.

---

## 1. Authentication Endpoints

### Register Studio Organization
```http
POST /api/auth/register
Content-Type: application/json
```
**Request Body**:
```json
{
  "organizationName": "DarkFront Games",
  "name": "Alex Mercer",
  "email": "alex@darkfront.com",
  "password": "SuperSecretPassword123!"
}
```
**Response (201 Created)**:
```json
{
  "organization": {
    "id": "org_e7b1a2c3",
    "name": "DarkFront Games",
    "slug": "darkfront-games"
  },
  "user": {
    "id": "usr_99f18a21",
    "email": "alex@darkfront.com",
    "role": "OWNER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### User Login
```http
POST /api/auth/login
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "alex@darkfront.com",
  "password": "SuperSecretPassword123!"
}
```
**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_99f18a21",
    "organizationId": "org_e7b1a2c3",
    "email": "alex@darkfront.com",
    "role": "OWNER"
  }
}
```

---

## 2. Ingestion Gateway Endpoints

### Discord Bot Webhook Ingestion
```http
POST /api/platform/ingest/discord/:sourceId
Content-Type: application/json
x-webhook-token: your_webhook_token_here
```
**Request Body**:
```json
{
  "id": "123456789012345678",
  "author": "PlayerGamer#1337",
  "content": "Level 5 boss is bugged, freezes when charging!"
}
```
**Response (200 OK)**:
```json
{
  "ok": true,
  "feedbackId": "fb_77a901ff",
  "status": "queued"
}
```

---

### Gameplay Telemetry Ingestion
```http
POST /api/platform/ingest/telemetry
Content-Type: application/json
x-api-key: your_telemetry_api_key_here
```
**Request Body**:
```json
{
  "events": [
    {
      "eventId": "evt-uuid-99a1",
      "playerId": "player-123",
      "sessionId": "session-5512",
      "target": "level_5",
      "eventType": "quit",
      "duration": 142,
      "build": "1.0.0"
    }
  ]
}
```
**Response (200 OK)**:
```json
{
  "ok": true,
  "ingestedCount": 1
}
```

---

## 3. Platform Operational Endpoints (Authenticated)

All routes require `Authorization: Bearer <JWT_TOKEN>`.

### List Correlated Issues
```http
GET /api/platform/issues?build=1.0.0&limit=50&offset=0
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK)**:
```json
{
  "issues": [
    {
      "id": "iss_55c1",
      "type": "Difficulty",
      "target": "Level 5",
      "summary": "Players experiencing extreme failure rates on Boss Phase 2",
      "severity": 0.88,
      "confidence": 0.94,
      "feedbackCount": 142,
      "anomalyDetected": true,
      "anomalyReasons": [
        "High abandonment dropoff (42% > 30%)",
        "High average retry attempts (7.4 > 5.0)"
      ],
      "status": "OPEN",
      "updatedAt": "2026-09-11T04:30:00Z"
    }
  ]
}
```

---

### Get Issue Evidence
```http
GET /api/platform/issues/:id/evidence
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK)**:
```json
{
  "issueId": "iss_55c1",
  "qualitative": [
    {
      "id": "fb_11",
      "author": "PlayerGamer#1337",
      "source": "DISCORD",
      "content": "Level 5 boss is bugged, freezes when charging!",
      "createdAt": "2026-09-11T03:15:00Z"
    }
  ],
  "quantitative": {
    "target": "level_5",
    "totalSessions": 850,
    "quits": 357,
    "abandonmentRate": 42.0,
    "averageAttempts": 7.4,
    "completionRate": 18.5
  }
}
```

---

### Request AI Patch Recommendations
```http
POST /api/platform/issues/:id/recommend
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK)**:
```json
{
  "issueId": "iss_55c1",
  "recommendations": [
    "Reduce Boss Phase 2 max health pool by 15-20% to prevent player burnout.",
    "Add an intermediate checkpoint before the charging phase to soften the retry penalty.",
    "Verify collision bounds during the charge animation to prevent physics lockups."
  ]
}
```
