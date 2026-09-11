# 🎨 Web Dashboard — User Experience & Operational Surfaces

## 1. Operational Overview (`/`)

The Overview is designed for daily standup reviews and triage sessions:
- **Top Decision Banner**: Highlights the single most critical game issue requiring immediate engineering or design intervention.
- **Signal Convergence Ribbon**: Shows the ratio of correlated feedback to telemetry events over the selected time window.
- **Active Workspace Status**: Displays active build version, total tracked sessions, and open issues distribution.

---

## 2. Issues Queue & Paired Evidence View (`/issues`)

Rather than treating bug tickets in isolation, the Issues queue ranks problems using multi-factor evidence:

```mermaid
card
    title "Sample Issue Card: Difficulty Spike — Level 5"
    Priority: CRITICAL
    Confidence: 94%
    Affected Build: v1.0.0
    
    Qualitative Evidence (Discord / Steam):
    • "Boss in Level 5 is way too hard, HP pool is absurd." (PlayerX)
    • "Game feels impossible on Stage 5, rage quit after 10 attempts." (Gamer99)
    
    Quantitative Evidence (Unity Telemetry):
    • Abandonment Rate: 42.0% [Anomaly > 30% Threshold]
    • Average Retries: 7.4 attempts [Anomaly > 5.0 Threshold]
    • Completion Rate: 18.5% [Anomaly < 35% Threshold]
    
    AI Grounded Recommendation:
    • Reduce Boss Phase 2 HP by 15-20% and add an intermediate checkpoint.
```

---

## 3. Release Comparison Surface (`/compare`)

During release validation (e.g. comparing Build `1.0.0` with hotfix Build `1.1.0`), the `/compare` route calculates explicit deltas ($\Delta$):
- **Abandonment $\Delta$**: Tracks whether players quit more or less frequently.
- **Completion Rate $\Delta$**: Verifies whether patch difficulty tweaks achieved their intended targets.
- **Negative Sentiment $\Delta$**: Measures community reception shift across release cycles.

---

## 4. Public Landing Surface (`/landing`)

The public landing page introduces studios to the platform via the **Signal Merge Program**:
1. **Hero**: Visualizes the convergence of chaotic player chat with raw telemetry curves.
2. **Interactive Evidence Preview**: Live sample cards showcasing real-world issue correlation.
3. **Architecture Rundown**: Explains how Gemini 2.5 Flash and deterministic telemetry correlation work together.
4. **Call to Action**: Seamless route to `/register` for account onboarding.
