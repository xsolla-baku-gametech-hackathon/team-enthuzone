# 🎮 Unity 3D Game Client & Telemetry Documentation

The **Game** component is a Unity 3D game project created using the **Universal Render Pipeline (URP)**. It integrates an automated runtime telemetry client (`TelemetrySender.cs`) that monitors and streams player behavior, difficulty progression, retry attempts, and abandonment dropoffs directly to the **Player Issue Intelligence** platform.

---

## 📑 Game Documentation Index

- [🕹️ Game Mechanics & Architecture](file:///docs/game/architecture.md) — Unity scene structure, player controls, camera rigging, obstacles, buffs, and level progression.
- [📡 C# Telemetry Integration](file:///docs/game/telemetry-sender.md) — `TelemetrySender.cs` singleton, event schema, background asynchronous dispatch loop, and API Key authentication.

---

## ⚡ Quick Start & Running in Unity Editor

### Prerequisites
- **Unity Editor**: Version 2022.3 LTS or 2023.2+ with URP support
- **Platform**: Windows / Mac / Linux Standalone or WebGL

### Opening the Project
1. Launch **Unity Hub**.
2. Click **Add** ➔ **Add project from disk**.
3. Select the `team-enthuzone/game` folder.
4. Open the project and navigate in the Project view to `Assets/Scenes/`.
5. Open `MainScene.unity` or `_Main.unity`.
6. Press the **Play** button in the Unity Editor toolbar.

---

## 🕹️ In-Game Controls

| Input | Action |
|:---|:---|
| `W` / `Up Arrow` / `Space` | Jump / Ascend |
| `A` / `Left Arrow` | Steer Left |
| `D` / `Right Arrow` | Steer Right |
| `S` / `Down Arrow` | Slide / Duck under obstacles |
| `Esc` | Pause / Abandon Session |
