// Turns raw answers into per-skill evidence and statuses.
// Status vocabulary:
//   ok          — all items correct
//   partial     — exactly one error (not enough to call a gap)
//   gap         — more than one error
//   unresolved  — still mixed after the extra check
// D2 (valency) has its own vocabulary: ok | helfenGap | categoryGap | partial | unresolved

import { DIAGNOSTIC_TASKS, EXTRA_CHECKS } from '../content/diagnostics.js';

export const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/\s+/g, ' ');

// D4 accepts either the ending ("em") or the whole word ("meinem").
export function normalizeEnding(raw, stem = 'mein') {
  const v = norm(raw);
  return v.startsWith(stem) ? v.slice(stem.length) : v;
}

function itemPrompt(task, item) {
  if (task.type === 'ending') return `[${item.case}] ${task.stem}___ ${item.noun}`;
  if (task.type === 'sort') return item.text;
  return item.case ? `[${item.case}] ${item.prompt}` : item.prompt;
}

function displayAnswer(task, value) {
  if (value == null || value === '') return '—';
  if (task.type === 'sort') return task.columns.find((c) => c.id === value)?.sub || value;
  if (task.type === 'ending') return `${task.stem}${value}`;
  return value;
}

export function evaluateTask(task, answers = {}) {
  return task.items.map((item) => {
    const raw = answers[item.id];
    const given = task.type === 'ending' ? normalizeEnding(raw, task.stem) : raw;
    const correct = given != null && norm(given) === norm(item.answer);
    return {
      task: task.id,
      item: item.id,
      skill: item.skill,
      prompt: itemPrompt(task, item),
      given: displayAnswer(task, given),
      givenRaw: given,
      expected: displayAnswer(task, item.answer),
      correct,
      control: !!item.control,
      key: !!item.key,
    };
  });
}

const statusFromErrors = (errors) => (errors === 0 ? 'ok' : errors === 1 ? 'partial' : 'gap');

// Pattern of errors in form tasks (D3/D4): explains HOW the learner fails.
function formPattern(evals, dativValue, akkValue) {
  const vals = evals.map((e) => norm(e.givenRaw));
  if (vals.every((v) => v === akkValue)) return { id: 'default-akk', text: `"${akkValue}" used everywhere — a default form, case ignored.` };
  if (vals.every((v) => v === dativValue)) return { id: 'over-dat', text: `"${dativValue}" used everywhere — Dativ form over-applied.` };
  if (evals.every((e) => e.correct)) return { id: 'clean', text: 'All items correct.' };
  return { id: 'mixed', text: 'No stable pattern between case and form.' };
}

export function scoreDiagnostics(answers, extraAnswers = {}) {
  const byId = Object.fromEntries(DIAGNOSTIC_TASKS.map((t) => [t.id, t]));
  const d1 = evaluateTask(byId.D1, answers.D1);
  const d2 = evaluateTask(byId.D2, answers.D2);
  const d3 = evaluateTask(byId.D3, answers.D3);
  const d4 = evaluateTask(byId.D4, answers.D4);

  // ---- G (D1)
  const gErrors = d1.filter((e) => !e.correct).length;
  const G = {
    status: statusFromErrors(gErrors),
    errors: gErrors,
    total: d1.length,
    keyWrong: d1.some((e) => e.key && !e.correct),
    evidence: d1,
  };
  // A single error that is NOT on Bruder is irrelevant to this error: treat as ok, noted.
  if (G.status === 'partial' && !G.keyWrong) {
    G.status = 'ok';
    G.note = 'One error on a noun other than Bruder — not relevant to this error.';
  }

  // ---- V (D2)
  const datItems = d2.filter((e) => !e.control);
  const ctrlItems = d2.filter((e) => e.control);
  const helfen = d2.find((e) => e.item === 'helfen');
  const datErrors = datItems.filter((e) => !e.correct).length;
  const ctrlErrors = ctrlItems.filter((e) => !e.correct).length;
  const allAkk = d2.every((e) => e.givenRaw === 'akk');
  let vStatus;
  // Two or more Akkusativ verbs in Dativ = unreliable sort (response bias / guessing).
  // NB: "everything in Akkusativ" is NOT treated as bias — it is exactly what H2b predicts.
  if (ctrlErrors >= 2) vStatus = 'partial';
  else if (datErrors >= 2) vStatus = 'categoryGap';
  else if (datErrors === 1 && !helfen.correct) vStatus = 'helfenGap';
  else if (datErrors === 1) vStatus = 'partial';
  else vStatus = 'ok';
  const V = {
    status: vStatus,
    datErrors,
    ctrlErrors,
    total: datItems.length,
    helfenCorrect: helfen.correct,
    allAkk,
    bias: ctrlErrors >= 2 ? 'Two or more Akkusativ verbs placed in Dativ — sort is not reliable.' : null,
    evidence: d2,
  };

  // ---- A (D3)
  const aErrors = d3.filter((e) => !e.correct).length;
  const A = { status: statusFromErrors(aErrors), errors: aErrors, total: d3.length, pattern: formPattern(d3, 'dem', 'den'), evidence: d3 };

  // ---- P (D4)
  const pErrors = d4.filter((e) => !e.correct).length;
  const P = { status: statusFromErrors(pErrors), errors: pErrors, total: d4.length, pattern: formPattern(d4, 'em', 'en'), evidence: d4 };

  const state = { G, V, A, P };
  applyExtraChecks(state, extraAnswers);
  return state;
}

// Extra check: 2 items. Both correct → overturn (ok). Both wrong → confirm gap. Mixed → unresolved.
function resolve(extraEvals) {
  const wrong = extraEvals.filter((e) => !e.correct).length;
  return wrong === 0 ? 'clean' : wrong === extraEvals.length ? 'confirmed' : 'mixed';
}

function applyExtraChecks(state, extraAnswers) {
  for (const key of ['G', 'V', 'A', 'P']) {
    const ans = extraAnswers[key];
    if (!ans) continue;
    const evals = evaluateTask(EXTRA_CHECKS[key], ans);
    const outcome = resolve(evals);
    const s = state[key];
    s.extra = { evidence: evals, outcome, before: s.status };
    if (key === 'V') {
      if (outcome === 'clean') {
        if (s.datErrors >= 2) s.status = 'unresolved';
        else s.status = s.helfenCorrect ? 'ok' : 'helfenGap';
      }
      else if (outcome === 'confirmed') s.status = 'categoryGap';
      else s.status = 'unresolved';
    } else if (outcome === 'clean') s.status = 'ok';
    else if (outcome === 'confirmed') s.status = 'gap';
    else s.status = 'unresolved';
  }
}

export const isGap = (key, s) =>
  key === 'V' ? s.status === 'helfenGap' || s.status === 'categoryGap' : s.status === 'gap';

export const errorRatio = (key, s) => (key === 'V' ? s.datErrors / s.total : s.errors / s.total);
