# 📐 Normalization & Anomaly Correlation Engines

In addition to generative AI extraction, the AI Service incorporates deterministic mathematical and algorithmic normalization engines (`src/engines.js`).

---

## 1. String & Target Normalization Engine

Player reports contain informal phrasing, emojis, case mismatches, and Roman numerals (e.g. `"lv v"`, `"STAGE 5"`, `"Level V"`). The normalization pipeline maps all variants to clean canonical targets:

### Normalization Pipeline:
1. **Unicode NFKC Decomposition**: Standardizes special characters and accents.
2. **Punctuation Stripping & Lowercasing**: Strips noise while preserving alphanumeric characters.
3. **Roman Numeral Conversion**: Replaces Roman numerals with Arabic numerals:
   ```javascript
   const roman = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };
   // "level v" -> "level 5"
   // "boss iv" -> "boss 4"
   ```
4. **Category Alias Mapping**:
   - `balance`, `hard`, `gameplay_balance` ➔ `difficulty`
   - `crash`, `freeze`, `glitch` ➔ `bug`
   - `lag`, `fps_drop`, `stutter` ➔ `performance`
   - `usability`, `ui`, `hud` ➔ `ux`

---

## 2. Telemetry Anomaly Detection & Correlation

The correlation engine compares an issue's target with aggregated gameplay telemetry to evaluate whether player complaints are backed by empirical behavior.

### Anomaly Thresholds:
For an issue in category `Difficulty` or `Performance`:
1. **High Abandonment Dropoff**:
   $$\text{Dropoff Rate} = \frac{\text{Quits}}{\text{Starts}} \times 100 \ge 30\%$$
   *Trigger*: Players are rage-quitting or abandoning the target at an abnormal rate.
2. **High Retry Attempts**:
   $$\text{Average Retries} = \frac{\text{Attempts}}{\text{Total Sessions}} \ge 5.0$$
   *Trigger*: Players require an excessive number of attempts to clear the target.
3. **Low Completion Rate**:
   $$\text{Completion Rate} = \frac{\text{Completes}}{\text{Starts}} \times 100 \le 35\%$$
   *Trigger*: More than two thirds of attempts fail to reach the objective.

### Correlation Confidence Score Formula:
$$\text{Score} = \frac{\sum \text{Matched Anomaly Checks}}{\text{Total Evaluated Checks}}$$

If $\text{Score} \ge \frac{2}{3} \approx 0.67$, the issue is classified as **Supported by Telemetry** (`supported: true`), elevating its triage ranking on the Studio Dashboard to **CRITICAL**.
