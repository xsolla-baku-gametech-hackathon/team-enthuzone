---
name: Player Issue Intelligence
description: Evidence-first GameTech issue triage in a live match director's control room.
colors:
  canvas: "#0d1014"
  sidebar: "#11151a"
  surface: "#171c23"
  surface-raised: "#20262f"
  surface-sunken: "#090c10"
  line: "#343c46"
  line-strong: "#56616d"
  text: "#f2f5f7"
  text-muted: "#a8b1bb"
  text-faint: "#87939f"
  accent: "#35b8a5"
  accent-strong: "#55d1bf"
  critical: "#e45b5b"
  critical-surface: "#32191c"
  high: "#ed9840"
  high-surface: "#392719"
  medium: "#e0bd4f"
  medium-surface: "#332f1b"
  low: "#7dbd8c"
  low-surface: "#1b3023"
  info: "#69a9e6"
  info-surface: "#182a3a"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 450
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  control: "0.25rem"
  panel: "0.375rem"
  status: "999px"
spacing:
  compact: "0.5rem"
  control: "0.75rem"
  panel: "1.25rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.9375rem"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  status-critical:
    backgroundColor: "{colors.critical-surface}"
    textColor: "{colors.critical}"
    rounded: "{rounded.status}"
---

# Design System: Player Issue Intelligence

## Overview

**Creative North Star: “Live Match Director”**

The interface borrows the operational grammar of an esports broadcast control room: a continuous score ribbon for shared context, a dominant program monitor for the issue currently driving decisions, calibrated signal plots, and a production rundown for ranked work. The reference is structural, not decorative—no neon gaming effects, gradients, or simulated broadcast noise.

This is a dense working surface for product and QA teams. Hierarchy comes from scale, alignment, tonal layers, and hard cuts between regions. Semantic color is scarce and always answers a question: severity, trend direction, evidence channel, or active state.

## Colors

The palette is a cool, near-black production booth with crisp light text, calibrated teal for active telemetry, blue for feedback, and severity colors reserved for status and trend meaning.

- `accent` / `accent-strong`: active controls, telemetry traces, focus, and high-importance active values.
- `info`: feedback traces and informational state.
- `critical`, `high`, `medium`, `low`: priority, outcome, and trend semantics only.
- `canvas`, `sidebar`, `surface`, `surface-raised`, `surface-sunken`: application and monitor depth.
- `text`, `text-muted`, `text-faint`: content hierarchy.
- `line`, `line-strong`: structural rules and selected boundaries.

**Semantic Color Rule:** accent and severity colors never decorate empty space; each instance communicates active state, source, severity, or trend.

**Theme Parity Rule:** dark and light themes preserve the same semantic roles. Contrast is calibrated per theme in `client/dashboard/app/globals.css`; never derive a light-theme state by opacity alone or substitute a literal palette color.

**No Gradient Rule:** every application surface is a solid token color.

## Typography

- **Interface:** Geist with sans-serif fallback.
- **Data:** Geist Mono with monospace fallback.
- Display: 700, 1.75rem, tight tracking for route and issue-detail titles.
- Title: 700, 1rem for monitor and table headings.
- Body: readable summaries and evidence excerpts with a 65–75 character target measure.
- Mono label: short build, event, timestamp, and calibrated metadata only.

**Instrument Type Rule:** Geist Mono is measurement equipment, not atmosphere; never use it for narrative copy or headings.

## Layout

Desktop uses a persistent sidebar and a fluid content field capped at 100rem. The workspace follows a 12-column logic: KPI readings form one continuous ribbon, the program issue and signal monitor share the next row, and the issue rundown spans the width below. Spacing follows an 8/12/16/20/32px rhythm.

Below 1024px, analytical monitors stack when readable width would be compromised. Below 768px, navigation, KPI ribbons, and dense tables scroll inside their own bounded regions; page content remains locked to the viewport and issue content stacks vertically.

Every operational route starts with a task-specific title and one concise purpose statement before workspace controls. Overview and issue routes lead with the highest-priority issue and its evidence; shared metrics support that decision instead of displacing it.

The public `/landing` route is a marketing surface outside the authenticated dashboard shell, while remaining visibly part of the Live Match Director system. Its first viewport pairs the concrete promise with a continuous sample score ribbon and a dominant sample issue monitor that keeps feedback and telemetry evidence together. At a 390px viewport, the page must not overflow horizontally and the issue, sample status, and paired evidence remain visible before the visitor leaves the first viewport.

## Elevation & Depth

The system is flat by default and uses no box shadows. Depth comes from three deliberate solid fills: raised/selected controls, primary monitor surfaces, and sunken chart wells. One-pixel rules separate neighboring data regions.

**Control Booth Rule:** a surface may contain rows, charts, and rule-separated regions, but never another card shell.

**Solid Surface Rule:** marketing and operational surfaces use semantic solid fills and structural rules; glass treatments, backdrop blur, decorative shadows, and translucent ornamental layers are not part of this system.

## Shapes

Controls use compact 4px corners; panels use restrained 6px corners; status labels alone use capsules. Large rounding is reserved for full-screen or high-attention dialog shells where it clarifies containment, never for ordinary data rows.

## Components

- **Buttons:** compact, operation-specific labels; calibrated teal for primary action and raised slate for neutral action.
- **Status labels:** semantic foreground/background pairs with bold 12px text; never decorative headings.
- **Panels:** flat monitor surfaces with no shadow and rules only between functional regions.
- **Inputs:** raised slate, structural inset ring, and signal-teal focus.
- **Navigation:** raised slate for the active route; narrow viewports use a horizontal keyboard-accessible strip. Route headers name the current operational task rather than repeating a generic dashboard title.
- **Program monitor:** overview and issue surfaces expose the top issue, priority, affected target/build context, and player/telemetry evidence before secondary totals.
- **Score ribbon:** one continuous KPI surface divided by rules, with directional or explanatory context attached to every value.
- **Signal monitor:** feedback blue and telemetry teal on a shared time axis; deterministic rendering without decorative animation.
- **Build comparison:** current and baseline builds are selected explicitly, cannot resolve to the same build, and produce labeled deltas against the baseline rather than isolated totals.
- **Landing program:** the “Signal Merge Program” composition proceeds from the concrete promise to feedback-and-telemetry convergence, the report-to-decision chain, an explicit current-versus-baseline build comparison, a cross-team rundown, and an operational `/register` action. Illustrative score, issue, evidence, and comparison values are labeled as sample data.
- **Dialogs:** every modal has dialog semantics, a programmatic title, Escape dismissal, a trapped focus cycle, inert background content, and focus restoration to the invoking control.

**Icon Language Rule:** interface symbols come from the shared Lucide set and include accessible names where needed; emojis are not UI status or feature markers.

**Motion Truth Rule:** animation may represent a genuine in-progress operation, but never decorates a static active, verified, or AI state.

## Do's and Don'ts

### Do

- Lead with issue priority, gameplay impact, affected build, confidence, and evidence relationships.
- Use solid tonal levels and structural rules to organize dense data.
- Include trend direction and comparison context with every metric.
- Keep wide analytical structures inside explicit horizontal-scroll regions on narrow screens.
- Preserve keyboard-complete modal behavior whenever a dialog is added or changed.

### Don't

- Do not use decorative gradients, beige AI palettes, generic purple-blue treatments, or ambient glow.
- Do not nest cards, add wide blur shadows, or use colored side-tab borders.
- Do not add italic serif display type, eyebrow chips, generic CTA copy, numbered section labels, or repeated icon tiles.
- Do not use pulsing “AI thinking” or static-status indicators; progress animation must correspond to real work in flight.
- Do not place emojis in interface copy or use them as feature and status icons.
- Do not place literal color values in UI files; all runtime UI color passes through semantic tokens in `client/dashboard/app/globals.css`.
