# German Grammar Diagnostic & Adaptive Repair — LXD prototype

Independent learning experience design concept. Not affiliated with Busuu. Diagnostic logic is simulated for demonstration purposes.

**Diagnose before you remediate:** one error (*Ich helfe meinen Bruder*) → 4 isolating checks → cautious hypothesis → targeted micro-practice → transfer check → skill profile.

## Run

```bash
npm install
npm run dev        # http://localhost:5180
npm run test:routes  # runs all scenarios + edge cases through the routing rules
```

## Structure

| Path | What |
|---|---|
| `src/content/` | Learning content only: skills & relations, D1–D4 + extra checks, practice P0–P5, transfer, route copy, scenarios |
| `src/logic/scoring.js` | Answers → per-skill evidence and status (ok / partial / gap / unresolved) |
| `src/logic/routing.js` | Ordered rules R1–R9, sequencing for multiple gaps, qualitative confidence, trace |
| `src/logic/transfer.js` | Transfer slot matching (determiner before the cue noun only) and interpretation |
| `src/logic/profile.js` | Skill Profile statuses (never "mastered" in one session) |
| `src/logic/plan.js` | Diagnostic plan: `full` (demo) vs. `adaptive` (future shortening) |
| `src/components/` | Learner screens, activities, Designer View, skill map, scenario panel |

All decisions are deterministic rules — no AI model is called.
