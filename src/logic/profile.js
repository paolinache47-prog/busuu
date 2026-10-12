// Skill Profile statuses. "Mastered" is never assigned in a single session.
//   assessment    — Needs assessment: evidence missing, mixed, or controlled-only
//   practice      — Needs practice: gap evidence, not yet overcome
//   improving     — Improving: successful practice or mixed context evidence
//   demonstrated  — Demonstrated in context: correct in free production, no counter-evidence

import { SKILL_ORDER } from '../content/skills.js';
import { TRANSFER } from '../content/transfer.js';
import { ORIGINAL_ERROR } from '../content/skills.js';

export const PROFILE_STATUSES = {
  assessment: { label: 'Needs assessment', text: 'Not enough evidence yet, or only seen in controlled tasks.' },
  practice: { label: 'Needs practice', text: 'A gap was found and has not been overcome yet.' },
  improving: { label: 'Improving', text: 'Practice went well, or context evidence is mixed.' },
  demonstrated: { label: 'Demonstrated in context', text: 'Used correctly in free production this session. Still needs a spaced re-check.' },
};

const BLOCK_SKILLS = { P0: ['G'], P1: ['V1'], P2: ['V2', 'V1'], P3: ['P'], P4: ['A'], P5: ['INT'] };
const GOOD_RATIO = 2 / 3;

function diagFor(key, state) {
  const { G, V, A, P } = state;
  const ev = (list) => list.map((e) => ({ source: e.task === 'Extra' ? 'Extra check' : e.task, text: `${e.prompt} → ${e.given}${e.correct ? '' : ` (expected ${e.expected})`}`, tone: e.correct ? 'pos' : 'neg' }));
  const withExtra = (s, list) => (s.extra ? [...ev(list), ...ev(s.extra.evidence.map((e) => ({ ...e, task: 'Extra' })))] : ev(list));
  switch (key) {
    case 'G':
      return { status: G.status, evidence: withExtra(G, G.evidence) };
    case 'V1': {
      const h = V.evidence.find((e) => e.item === 'helfen');
      return { status: h.correct ? 'ok' : 'gap', evidence: ev([h]) };
    }
    case 'V2': {
      const items = V.evidence.filter((e) => e.item !== 'helfen');
      const st = V.status === 'categoryGap' ? 'gap' : ['partial', 'unresolved'].includes(V.status) ? 'unresolved' : 'ok';
      return { status: st, evidence: withExtra(V, items) };
    }
    case 'A':
      return { status: A.status, evidence: withExtra(A, A.evidence) };
    case 'P':
      return { status: P.status, evidence: withExtra(P, P.evidence) };
    default:
      return { status: 'none', evidence: [] };
  }
}

export function computeProfile({ state, practice = {}, transferResults = [] }) {
  const rows = {};
  for (const key of SKILL_ORDER) {
    const d = state ? diagFor(key, state) : { status: 'none', evidence: [] };
    const evidence = [...d.evidence];

    if (['V1', 'A', 'P', 'INT'].includes(key)) {
      evidence.unshift({ source: 'Original', text: `"${ORIGINAL_ERROR.learner}" — one error, consistent with several causes`, tone: 'mixed' });
    }

    // practice
    let practiced = null;
    for (const [block, skills] of Object.entries(BLOCK_SKILLS)) {
      const p = practice[block];
      if (!p || !skills.includes(key) || !p.done) continue;
      const ratio = p.total ? p.firstTry / p.total : 0;
      const good = ratio >= GOOD_RATIO;
      practiced = practiced === 'good' ? 'good' : good ? 'good' : 'supported';
      evidence.push({ source: block, text: `Practice: ${p.firstTry}/${p.total} correct on first try`, tone: good ? 'pos' : 'mixed' });
    }

    // transfer
    const pos = [], neg = [];
    for (const slot of TRANSFER.slots) {
      const r = transferResults.find((x) => x.slot === slot.id);
      if (!r || !['correct', 'wrong'].includes(r.status)) continue;
      let counts = slot.skills.includes(key) || (key === 'A' && r.usedArticle);
      // A wrong case (meinen for meinem) is still a masculine form: not evidence against gender.
      if (key === 'G' && !r.correct && r.errorType !== 'other-form') counts = false;
      if (!counts) continue;
      (r.correct ? pos : neg).push(slot.id);
      evidence.push({ source: `Transfer ${slot.id}`, text: `wrote "${r.phrase}"${r.correct ? '' : ` (expected ${slot.expectedCase})`}`, tone: r.correct ? 'pos' : 'neg' });
    }

    let status, note = null;
    if (pos.length && !neg.length) status = 'demonstrated';
    else if (pos.length && neg.length) { status = 'improving'; note = 'Mixed evidence in context.'; }
    else if (neg.length) status = 'practice';
    else if (d.status === 'gap') status = practiced === 'good' ? 'improving' : 'practice';
    else if (d.status === 'unresolved' || d.status === 'partial') status = practiced === 'good' ? 'improving' : 'assessment';
    else if (d.status === 'ok') { status = 'assessment'; note = 'Correct in controlled tasks — not yet seen in context.'; }
    else status = 'assessment';

    if (key === 'A' && status === 'assessment' && transferResults.length && !pos.length && !neg.length) {
      note = 'Not observed directly in context: the learner used possessives, not articles.';
    }
    rows[key] = { status, note, diagStatus: d.status, evidence };
  }
  return rows;
}
