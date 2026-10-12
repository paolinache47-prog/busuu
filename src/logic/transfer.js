// Transfer Check scoring. Only the determiner before the cue noun is evaluated.
// Word order, verb form and spelling elsewhere are NOT scored.

const ARTICLES = ['der', 'die', 'das', 'den', 'dem', 'des'];

export function evaluateSlot(slot, text) {
  const raw = String(text || '').trim();
  if (!raw) return { slot: slot.id, status: 'empty' };
  const re = new RegExp(`([A-Za-zÄÖÜäöüß]+)\\s+${slot.noun}\\b`, 'i');
  const m = raw.match(re);
  const verbFound = slot.verbStems.some((s) => raw.toLowerCase().includes(s));
  if (!m) return { slot: slot.id, status: 'notFound', verbFound };
  const det = m[1].toLowerCase();
  const correct = slot.accept.includes(det);
  let errorType = null;
  if (!correct) {
    if (slot.expectedCase === 'Dativ' && /en$/.test(det)) errorType = 'akk-for-dat';
    else if (slot.expectedCase === 'Akkusativ' && /em$/.test(det)) errorType = 'dat-for-akk';
    else errorType = 'other-form';
  }
  return {
    slot: slot.id,
    status: correct ? 'correct' : 'wrong',
    det,
    phrase: `${m[1]} ${slot.noun}`,
    correct,
    errorType,
    verbFound,
    usedArticle: ARTICLES.includes(det),
  };
}

export const ERROR_TEXT = {
  'akk-for-dat': 'Akkusativ form where Dativ is needed',
  'dat-for-akk': 'Dativ form where Akkusativ is needed',
  'other-form': 'Unexpected form',
};

// Where to send the learner after an over-generalisation, by route.
const CONTRAST_ACTIVITY = { R1: 'P1-a2', R2: 'P2-a2', R6: 'P2-a2', R3: 'P3-a3', R4: 'P3-a3', R5: 'P3-a3', R7: 'P3-a3', R8: 'P3-a3', R9: 'P3-a3' };

export function interpretTransfer(results, rule) {
  const [a, b, c] = ['A', 'B', 'C'].map((id) => results.find((r) => r.slot === id));
  if ([a, b, c].some((r) => !r || r.status === 'empty' || r.status === 'notFound')) {
    return { outcome: 'incomplete' };
  }
  let outcome, text, next, contrastActivity = null;
  if (a.correct && b.correct) {
    outcome = 'confirmed';
    text = 'The target form appeared in a new context, and the Akkusativ control stayed correct.';
    next = 'Shown in context once — not "mastered". A spaced re-check in a later session is planned.';
  } else if (a.correct && !b.correct) {
    outcome = 'overgeneralized';
    text = b.errorType === 'dat-for-akk'
      ? '-em also appeared after besuchen. The rule may have turned into "-em everywhere".'
      : 'The Dativ form was right, but the Akkusativ control was not.';
    next = 'Next: a short contrast exercise (Dativ vs. Akkusativ verbs).';
    contrastActivity = CONTRAST_ACTIVITY[rule] || 'P3-a3';
  } else if (rule === 'R5') {
    outcome = 'automatization';
    text = 'The rule was known in controlled tasks but the slip came back in free writing. This supports H5.';
    next = 'Next: spaced production practice and the self-check routine — not rule re-teaching.';
  } else {
    outcome = 'recheck';
    text = 'The target form did not transfer to the new context. The working hypothesis may have been wrong.';
    next = 'Next session: a short re-diagnosis with new items (not the same ones).';
  }

  let cNote;
  if (c.correct) cNote = 'Slot C (antworten): Dativ also correct with a second Dativ verb in free writing.';
  else if (rule === 'R1') cNote = 'Slot C (antworten): wrong, although antworten was sorted correctly in D2. Knowing the group in a controlled task does not yet show in production — keep H2b and H5 open.';
  else cNote = `Slot C (antworten): ${ERROR_TEXT[c.errorType] || 'wrong'}. Informative only — it does not change the decision above.`;

  return { outcome, text, next, cNote, contrastActivity };
}
