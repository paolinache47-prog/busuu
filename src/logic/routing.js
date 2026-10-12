// Deterministic routing R1–R9. Ordered rules, first match wins.
// Input: scored state from scoring.js. Output: route, practice sequence, confidence, trace.

import { isGap, errorRatio } from './scoring.js';
import { ROUTES } from '../content/routes.js';

export const MAX_BLOCKS_PER_SESSION = 2;

// ---------- extra checks (R7 / R8 / R9 triggers)
export function pendingExtraChecks(state) {
  const out = [];
  const { G, V, A, P } = state;
  if (!G.extra && (G.status === 'gap' || G.status === 'partial')) out.push({ key: 'G', rule: 'R7', why: 'Gender answer contradicts the original "meinen" (a masculine form).' });
  if (!V.extra && V.status === 'partial') out.push({ key: 'V', rule: 'R8', why: V.bias || 'One Dativ verb (not helfen) misplaced — not enough to call a gap.' });
  if (!A.extra && A.status === 'partial') out.push({ key: 'A', rule: 'R8', why: 'One article error out of three.' });
  if (!A.extra && A.status === 'gap' && P.status === 'ok') out.push({ key: 'A', rule: 'R9', why: 'Articles wrong while mein- endings are right — contradictory.' });
  if (!P.extra && P.status === 'partial') out.push({ key: 'P', rule: 'R8', why: 'One ending error out of three.' });
  return out;
}

// ---------- block selection
const valencyBlock = (V) => (V.status === 'helfenGap' ? 'P1' : 'P2');
const LIGHT_BLOCK = { G: 'P0', V: 'P2', A: 'P4', P: 'P3' };
const pct = (r) => `${Math.round(r * 3)}/3`;

function core(state) {
  const { V, A, P } = state;
  const vGap = isGap('V', V);
  const aGap = isGap('A', A);
  const pGap = isGap('P', P);

  if (aGap && !pGap && !vGap) {
    return { rule: 'R9', blocks: ['P4'], reason: 'Article errors are confirmed even though mein- went well. Practising den/dem directly; mein- may be a memorised chunk.' };
  }
  if (vGap && (aGap || pGap)) {
    const vb = valencyBlock(V);
    const forms = aGap ? (pGap ? ['P4', 'P3'] : ['P4']) : ['P3'];
    const fKey = aGap ? 'A' : 'P';
    const rv = errorRatio('V', V);
    const rf = errorRatio(fKey, state[fKey]);
    const fName = aGap ? 'article forms (D3)' : 'mein- endings (D4)';
    let order, reason;
    if (rf > rv) {
      order = [...forms, vb];
      reason = `Forms first: errors in ${fName} were more widespread (${pct(rf)}) than in verb choice (${pct(rv)}), even with the case given. Without stable forms, practice on verb choice would not show in the learner's output.`;
    } else if (rv > rf) {
      order = [vb, ...forms];
      reason = `Verb choice first: valency errors (${pct(rv)}) outweigh errors in ${fName} (${pct(rf)}). The forms are partly there, so practice on choosing Dativ can already use them.`;
    } else {
      order = [vb, ...forms];
      reason = `Equal evidence (${pct(rv)} vs ${pct(rf)}). Verb choice first, because choosing the case is the first decision when building the sentence; form practice follows and reuses the same verbs.`;
    }
    if (aGap && pGap) reason += ' Within forms, den/dem comes before mein- because it is a learning prerequisite (A → P).';
    return { rule: 'R6', blocks: order, reason, lesson: true };
  }
  if (aGap && pGap) {
    return { rule: 'R4', blocks: ['P4', 'P3'], reason: 'den/dem first: article mapping is a learning prerequisite for mein- endings (A → P).' };
  }
  if (pGap) return { rule: 'R3', blocks: ['P3'], reason: 'Article forms and verb choice are solid; only the possessive ending is affected.' };
  if (V.status === 'categoryGap') return { rule: 'R2', blocks: ['P2'], reason: 'Two or more Dativ verbs were sorted as Akkusativ — practice targets the whole group, not only helfen.' };
  if (V.status === 'helfenGap') return { rule: 'R1', blocks: ['P1'], reason: 'Only helfen was misplaced; danken and antworten were correct — practice targets helfen specifically.' };
  return { rule: 'R5', blocks: ['P5'], reason: 'No rule gap found in the controlled checks. Re-teaching rules would not help; the practice targets speed and self-monitoring.' };
}

// ---------- hypotheses implied by the final state
function hypothesesFor(state) {
  const h = [];
  if (state.G.status === 'gap') h.push('H1');
  if (state.V.status === 'helfenGap') h.push('H2a');
  if (state.V.status === 'categoryGap') h.push('H2b');
  if (isGap('A', state.A)) h.push('H3');
  if (isGap('P', state.P)) h.push('H4');
  return h;
}

// ---------- confidence (qualitative, rule-based)
export const CONFIDENCE_RUBRIC = [
  { level: 'high', text: 'Every item for the affected skill points the same way, all other skills are clean, and no extra check was needed.' },
  { level: 'medium', text: 'The pattern is clear but rests on few items, relies on terminology (D2), needed an extra check, or is a hypothesis by exclusion (R5), or several gaps interact (R6).' },
  { level: 'low', text: 'Evidence contradicts itself (R7, R9) or stays mixed after the extra check (R8).' },
];

function confidenceFor(rule, state, usedExtra) {
  const { G, V, A, P } = state;
  const reasons = [];
  let level = 'medium';
  const cleanOthers = (skip) =>
    (skip === 'V' || (V.status === 'ok' && V.ctrlErrors === 0)) &&
    (skip === 'A' || A.errors === 0) &&
    (skip === 'P' || P.errors === 0) &&
    G.status === 'ok';

  switch (rule) {
    case 'R1':
      reasons.push('helfen evidence = one sort item + the original sentence.');
      reasons.push('D2 depends on knowing the terms wen?/wem? — capped at medium.');
      break;
    case 'R2':
      reasons.push(`${V.datErrors} of 3 Dativ verbs sorted as Akkusativ.`);
      if (V.allAkk) reasons.push('All six verbs went to wen? — consistent with H2b, but also with not understanding the sorting task.');
      reasons.push('D2 depends on knowing the terms wen?/wem? — capped at medium.');
      break;
    case 'R3': {
      const datWrong = P.evidence.filter((e) => !e.control && !e.correct).length;
      const ctrlOk = P.evidence.filter((e) => e.control).every((e) => e.correct);
      if (datWrong === 2 && ctrlOk && cleanOthers('P')) {
        level = 'high';
        reasons.push('Both Dativ items wrong, Akkusativ control right, all other skills clean.');
      } else reasons.push('The ending pattern is not fully consistent, or another skill shows minor errors.');
      break;
    }
    case 'R4':
      if (A.errors >= 2 && P.errors >= 2 && V.status === 'ok' && V.ctrlErrors === 0) {
        level = 'high';
        reasons.push('Article and possessive tasks fail in the same way; verb choice is clean.');
      } else reasons.push('Form errors are clear, but verb-choice evidence is not fully clean.');
      break;
    case 'R5':
      reasons.push('Hypothesis by exclusion: no gap found, supported only by the single original error.');
      if (V.ctrlErrors > 0 || G.note) {
        level = 'low';
        reasons.push('Minor inconsistencies in the checks.');
      }
      break;
    case 'R6':
      reasons.push('Several gaps interact; the order is a judgement from error ratios.');
      break;
    default:
      level = 'low';
      reasons.push(rule === 'R8' ? 'Answers stayed mixed after the extra check.' : 'Evidence contradicts itself.');
  }
  if (usedExtra && level === 'high') {
    level = 'medium';
    reasons.push('Needed an extra check to decide.');
  } else if (usedExtra) reasons.push('Route decided after an extra check.');
  if (V.ctrlErrors === 1 && level === 'high') {
    level = 'medium';
    reasons.push('One Akkusativ verb misplaced in D2.');
  }
  return { level, reasons };
}

// ---------- main
export function route(state) {
  const pending = pendingExtraChecks(state);
  if (pending.length) {
    return { stage: 'pending', pending, trace: traceRules(state, null) };
  }

  const keys = ['G', 'V', 'A', 'P'];
  const usedExtra = keys.some((k) => state[k].extra);
  const extraLog = keys.filter((k) => state[k].extra).map((k) => ({ key: k, ...state[k].extra }));
  const unresolved = keys.filter((k) => state[k].status === 'unresolved');
  const c = core(state);

  let rule = c.rule;
  let blocks = [...c.blocks];
  let reason = c.reason;
  let light = [];

  if (state.G.status === 'gap') {
    rule = 'R7';
    blocks = ['P0', ...(c.rule === 'R5' ? [] : blocks)];
    reason = `Gender confirmed by the extra check. It comes first because it is a learning prerequisite for article endings (G → A).${c.rule !== 'R5' ? ' Then: ' + c.reason : ''}`;
  } else if (unresolved.length) {
    rule = 'R8';
    light = unresolved.map((k) => LIGHT_BLOCK[k]);
    blocks = [...(c.rule === 'R5' ? [] : blocks), ...light.filter((b) => !blocks.includes(b))];
    reason = `Still mixed after the extra check (${unresolved.map((k) => skillLabel(k)).join(', ')}). No gap is claimed: a light practice block, and a re-check in a later session.${c.rule !== 'R5' ? ' Clear gaps first: ' + c.reason : ''}`;
  }

  const session = blocks.slice(0, MAX_BLOCKS_PER_SESSION);
  const deferred = blocks.slice(MAX_BLOCKS_PER_SESSION);
  const hypotheses = rule === 'R5' ? ['H5'] : hypothesesFor(state);

  return {
    stage: 'final',
    rule,
    coreRule: c.rule,
    hypotheses,
    blocks: session,
    deferred,
    light,
    lesson: !!c.lesson || deferred.length > 0,
    reason,
    unresolved,
    confidence: confidenceFor(rule, state, usedExtra),
    extraLog,
    copy: ROUTES[rule],
    trace: traceRules(state, rule),
  };
}

function skillLabel(k) {
  return { G: 'gender', V: 'verb choice', A: 'den/dem', P: 'mein- endings' }[k];
}

// ---------- trace for Designer View: every rule, its condition, whether it matched
export function traceRules(state, firedRule) {
  const { G, V, A, P } = state;
  const vGap = isGap('V', V), aGap = isGap('A', A), pGap = isGap('P', P);
  const rows = [
    { id: 'R7', cond: 'D1 gap, confirmed by extra check', matched: G.status === 'gap' },
    { id: 'R8', cond: 'Any skill still mixed after extra check', matched: ['G', 'V', 'A', 'P'].some((k) => state[k].status === 'unresolved') },
    { id: 'R9', cond: 'D3 gap while D4 ok (contradiction), confirmed', matched: aGap && !pGap && !vGap },
    { id: 'R6', cond: 'D2 gap AND (D3 gap OR D4 gap)', matched: vGap && (aGap || pGap) },
    { id: 'R4', cond: 'D3 gap AND D4 gap, D2 ok', matched: aGap && pGap },
    { id: 'R3', cond: 'D4 gap only', matched: pGap },
    { id: 'R2', cond: 'D2: ≥2 of 3 Dativ verbs misplaced', matched: V.status === 'categoryGap' },
    { id: 'R1', cond: 'D2: only helfen misplaced', matched: V.status === 'helfenGap' },
    { id: 'R5', cond: 'No gap in D1–D4', matched: !vGap && !aGap && !pGap && G.status !== 'gap' },
  ];
  return rows.map((r) => ({ ...r, fired: r.id === firedRule }));
}
