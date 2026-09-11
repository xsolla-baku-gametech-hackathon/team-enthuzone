# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router with TypeScript and Tailwind CSS in `client/dashboard`; thin route wrappers compose client-side operational workspaces that use typed HTTP requests and local interaction state, while Recharts renders analytical charts.

## Users

Primary users are game studio product managers and QA leads. Game designers are a close secondary audience. They work in rapid triage and release-review sessions and need a data-dense but clear surface for deciding what to investigate, fix, or validate next.

## Product Purpose

The Player Issue Intelligence Platform correlates player feedback with gameplay telemetry and turns that evidence into prioritized issues. Success means a studio user can identify the most critical issue, understand why it is critical, see the affected build and segment, and move into the supporting evidence within ten seconds.

## Positioning

Unlike feedback-only or telemetry-only analytics, the product ranks issues using correlated qualitative player reports and quantitative in-game behavior, exposing confidence and evidence rather than a black-box score.

## Operating Context

Users review an overview during daily triage, filter and sort issue queues, inspect feedback and telemetry evidence, explore topic clusters, examine event trends, and compare two game builds during release validation. Time range and build filters must remain accessible throughout these workflows.

The public marketing surface lives at `/landing`, outside the authenticated dashboard shell. Its “Signal Merge Program” sequence moves from a concrete product promise through feedback-and-telemetry convergence, the report-to-decision chain, an explicit current-versus-baseline build comparison, a cross-team rundown, and an operational account-creation action at `/register`.

## Capabilities and Constraints

- The frontend app lives at `client/dashboard`; backend contracts are consumed through typed fetch clients.
- Required routes: overview, issues list, issue detail, feedback, telemetry, compare, bots, authentication, and Super Admin audit logs.
- Every operational route begins with a route-specific task title and concise purpose statement; a generic dashboard heading is not sufficient orientation.
- Overview and issue routes are issue-first: the highest-priority problem, its player impact, affected target/build context, confidence, and supporting evidence precede secondary workspace totals.
- Every displayed metric includes direction or contextual change; no standalone metric values.
- Build comparison requires explicit current and baseline selectors and labels every calculated change as a delta from the baseline.
- Priority color is semantic: critical red, high orange, medium yellow, low neutral/green.
- Desktop and tablet are primary targets; mobile must remain readable and navigable.
- The landing first viewport must expose a sample-labeled score ribbon and a sample-labeled critical issue with paired player-feedback and gameplay-telemetry evidence; every illustrative value is labeled as sample data.
- The landing primary conversion action routes to `/register` and uses operational account or workspace language rather than an unsupported commercial claim.
- Modal workflows are keyboard-complete: named dialog semantics, trapped focus, Escape dismissal, inert background content, and focus restoration are required.
- No decorative gradients, nested cards, generic CTA copy, eyebrow chips, numbered feature labels, decorative side-tab borders, pulsing AI indicators, repeated icon-tile stacks, or generic thin-border/wide-shadow cards.

## Brand Commitments

The working product name is Player Issue Intelligence. Voice is operational, precise, evidence-led, and concise. PlayerXP, Magify, and GameAnalytics are functional references only; their visual identity must not be copied.

## Evidence on Hand

The repository contains production-oriented feedback, telemetry, authentication, workspace, connection, issue ranking, AI analysis, and audit-log flows. UI demonstration data must be clearly identified as sample data and must not be presented as a commercial claim.

## Product Principles

- Lead with the decision: priority, impact, affected build, and evidence are visible before secondary analysis.
- Make correlation inspectable by pairing feedback and telemetry rather than reducing both to one opaque score.
- Use density with hierarchy: compact layouts, stable alignment, and restrained semantic color.
- Preserve analytical context across routes.
- Treat release comparison and issue triage as recurring operational work, not as a marketing narrative.

## Accessibility & Inclusion

Support keyboard navigation, visible focus, reduced motion, semantic landmarks, chart alternatives, and sufficient text and status contrast. Color is never the only carrier of priority, sentiment, or trend direction.
