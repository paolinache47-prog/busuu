// Diagnostic plan. The demo always runs in "full" mode (all D1–D4).
// "adaptive" mode shows how the diagnostic could be shortened once a learner
// already has enough prior evidence for a skill (e.g. from earlier sessions).

import { DIAGNOSTIC_TASKS } from '../content/diagnostics.js';

export const DIAGNOSTIC_MODE = 'full';

// priorEvidence: { [skillKey]: { sessions: number, consistent: boolean } }
export const SKIP_RULE = 'Skip a task only if every skill it measures was observed in ≥2 earlier sessions with consistent results.';

export function planDiagnostic({ mode = DIAGNOSTIC_MODE, priorEvidence = {} } = {}) {
  return DIAGNOSTIC_TASKS.map((task) => {
    if (mode === 'full') return { task, include: true, why: 'Full demo mode: all tasks are shown.' };
    const known = task.skills.every((s) => priorEvidence[s]?.sessions >= 2 && priorEvidence[s]?.consistent);
    return { task, include: !known, why: known ? 'Enough consistent prior evidence.' : 'Not enough prior evidence.' };
  });
}
