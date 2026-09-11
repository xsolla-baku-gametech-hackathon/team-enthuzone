# 🔄 End-to-End User Flows & Journeys

This document outlines the complete behavioral flows, state transitions, and step-by-step user journeys across the **Player Issue Intelligence (Enthuzone)** platform.

---

## 1. Studio Onboarding & Integration Setup

```mermaid
journey
    title Studio Onboarding Flow
    section Registration
      Visit /register: 5: Studio Lead
      Enter Org Name, Email, Password: 4: Studio Lead
      Atomic Transaction (Org + Owner created): 5: Core Server
    section Integration
      Navigate to Workspace Settings: 5: Studio Lead
      Add Telemetry Source -> Generate API Key: 5: Studio Lead
      Paste API Key into Unity TelemetrySender.cs: 4: Game Dev
      Add Discord Source -> Generate Webhook Token: 5: Studio Lead
      Paste Webhook Token into discord-bot/.env: 4: Community Lead
```

### Step-by-Step:
1. **Account Creation**: The Studio Lead registers at `/register`.
2. **Transaction**: The server runs an atomic MongoDB replica-set transaction creating an `Organization` and a `User` with `OWNER` role.
3. **Workspace Initialization**: Default workspace is provisioned with default retention and build tracking rules.
4. **Source Connections**:
   - The Studio Lead creates a **Unity Telemetry** source, generating a unique `x-api-key`.
   - The Studio Lead creates a **Discord Relay** source, generating a unique `sourceId` and `x-webhook-token`.
5. **Client Configuration**:
   - `x-api-key` is configured in Unity's `TelemetrySender.cs`.
   - `DISCORD_SOURCE_ID` and `DISCORD_WEBHOOK_TOKEN` are configured in `discord-bot/.env`.

---

## 2. In-Game Gameplay & Telemetry Emission Flow

```mermaid
sequenceDiagram
    autonumber
    actor Player as 🎮 Gamer
    participant Game as 🕹️ Unity Game Client
    participant Sender as 📡 TelemetrySender (Singleton)
    participant Core as ⚡ Core Ingest API

    Player->>Game: Launch Game (Loads Level 1)
    Game->>Sender: InitializeMockData() / StartRequest()
    Sender->>Sender: Generate Session ID ("session-1234")
    
    loop Every 5 Seconds or Game Event
        Player->>Game: Plays, jumps, takes damage, retries
        Game->>Sender: TelemetryEvent (start / attempt / complete / quit)
        Sender->>Core: POST /api/platform/ingest/telemetry
        Note over Sender,Core: JSON Payload with eventId, target, buildVersion, duration
        Core-->>Sender: 200 OK (Batch Queued)
    end

    Player->>Game: Exits or quits game
    Game->>Sender: TelemetryEvent (quit / session_end)
    Sender->>Core: Final Flush
    Sender->>Sender: EndRequest()
```

---

## 3. Community Feedback Ingestion Flow (Discord)

```mermaid
sequenceDiagram
    autonumber
    actor Player as 💬 Discord Player
    participant Channel as 📢 #feedback Channel
    participant Bot as 🤖 Discord Bot Relay
    participant Core as ⚡ Core Ingest API

    Player->>Channel: "Boss at Level 5 is impossible to beat, keeps one-shotting!"
    Channel->>Bot: WebSocket Event: messageCreate
    
    Bot->>Bot: Filter: Not a bot? Channel matches config? Non-empty?
    Bot->>Bot: Enqueue into sequential promise queue
    
    Bot->>Core: POST /api/platform/ingest/discord/:sourceId
    Note over Bot,Core: Header: x-webhook-token<br/>Body: { id, author, content }
    
    Core->>Core: Authenticate webhook token against Connection
    Core->>Core: Insert Feedback (status: "pending")
    Core-->>Bot: 200 OK
    
    Bot->>Channel: React with 🎮 emoji on player's message
    Note over Player,Channel: Player receives immediate visual confirmation
```

---

## 4. AI Categorization, Deduplication & Clustering Flow

```mermaid
flowchart TD
    RawFeedback["📝 Raw Feedback (status: pending)"]
    ClaimStep["🔒 Core Server Claims Feedback (status: processing)"]
    FetchClusters["🔍 Retrieve Active Workspace Clusters (Limit 100)"]
    SendToAI["🚀 POST /internal/ai/analyze-feedback"]
    
    subgraph AIService["AI Intelligence Microservice (:4001)"]
        GeminiCall["🧠 Gemini 2.5 Flash Structured Prompt\n(System instructions + JSON Schema)"]
        Normalization["📐 Unicode NFKC & Roman Numeral Normalization\n('Level V' ➔ 'Level 5', 'Boss HP' ➔ 'Difficulty')"]
        EnrichResult["📦 Output: { type, target, severity, confidence, authenticity, summary }"]
        GeminiCall --> Normalization --> EnrichResult
    end

    UpdateCluster["📊 Find or Upsert Cluster (Issue)\n(Match: workspaceId, type, target)"]
    EvidenceLink["🔗 Record Evidence Relationship in MongoDB"]
    FinalStatus["✅ Feedback status updated to 'completed'"]

    RawFeedback --> ClaimStep --> FetchClusters --> SendToAI
    SendToAI --> AIService --> UpdateCluster --> EvidenceLink --> FinalStatus
```

---

## 5. Product Manager & QA Lead Issue Triage Flow

```mermaid
sequenceDiagram
    autonumber
    actor QA as 👩‍💻 QA Lead / PM
    participant UI as 💻 Next.js Dashboard
    participant Core as ⚡ Core Server
    participant AI as 🧠 AI Service

    QA->>UI: Open /issues Route
    UI->>Core: GET /api/platform/issues?build=1.0.0
    Core-->>UI: Sorted list of prioritized issues
    
    Note over UI: QA sees top issue: "Difficulty Spike - Level 5"<br/>Priority: CRITICAL | Confidence: 94%

    QA->>UI: Clicks on "Level 5 Difficulty Spike" Detail View
    UI->>Core: GET /api/platform/issues/:id/evidence
    Core-->>UI: Paired Evidence (Discord Feedback Quotes + Telemetry Metrics)

    Note over UI: Evidence Dashboard Displays:<br/>1. Player Reports: "Boss has too much HP"<br/>2. Quantitative Telemetry: 45% Abandonment Rate (Anomaly > 30%)<br/>3. Average Retries: 7.2 attempts (Anomaly > 5.0)

    QA->>UI: Request AI Patch Advice
    UI->>Core: POST /api/platform/issues/:id/recommend
    Core->>AI: POST /internal/ai/recommend
    AI-->>Core: 3 Actionable Recommendations
    Core-->>UI: Display Suggestions (e.g. "Reduce Boss Phase 2 HP by 20%")
    QA->>UI: Updates Issue Status to "In Progress" & Assigns to Gameplay Team
```

---

## 6. A/B Release Validation & Build Comparison Flow

```mermaid
flowchart LR
    SelectBuilds["⚙️ Select Builds\nBaseline: v1.0.0 vs Current: v1.1.0"]
    FetchMetrics["📊 Fetch Telemetry & Issues for both Builds"]
    ComputeDeltas["📈 Calculate Metric Deltas (Δ)"]
    RenderView["🖥️ Render Comparison Surface (/compare)"]

    subgraph ComparisonSurface["Comparison Insights"]
        Delta1["📉 Abandonment Rate: -18% (Improved ✅)"]
        Delta2["📈 Level 5 Completion Rate: +24% (Fixed ✅)"]
        Delta3["📉 Discord Bug Mentions: -65% (Resolved ✅)"]
    end

    SelectBuilds --> FetchMetrics --> ComputeDeltas --> RenderView --> ComparisonSurface
```

---

## 7. Super Admin Governance & Audit Logging Flow

All high-impact administrative actions across the platform are automatically audited:
1. **Actor Recording**: Captures `userId`, `organizationId`, and role.
2. **Action Classification**: Records action type (`WORKSPACE_CREATE`, `CONNECTION_DELETE`, `KEY_ROTATION`, `ISSUE_RESOLVE`).
3. **Immutability**: Audit logs are written to an append-only collection (`audit_logs`) and exposed only to users with the `SUPER_ADMIN` role at `/admin`.
