// Human-readable copy for routes R1–R9. The conditions themselves live in src/logic/routing.js.

export const ROUTES = {
  R1: {
    title: 'helfen + Dativ',
    hypothesis: 'H2a',
    learner: 'You may not yet link helfen with Dativ. Other verbs like danken went into the right group.',
    alternatives: [
      { h: 'H5', text: 'A one-off slip: the D2 evidence for helfen is a single item plus the original sentence.' },
      { h: 'H2b', text: 'A wider Dativ-verb gap that only two other verbs could not reveal.' },
    ],
  },
  R2: {
    title: 'Dativ verbs as a group',
    hypothesis: 'H2b',
    learner: 'Verbs like helfen, danken and antworten may not yet feel like one group that asks wem?',
    alternatives: [
      { h: '—', text: 'Unfamiliar terminology (wen?/wem?, Akkusativ/Dativ) rather than a real valency gap.' },
    ],
  },
  R3: {
    title: 'mein- → meinem',
    hypothesis: 'H4',
    learner: 'You choose dem confidently — but mein- does not follow the same pattern yet.',
    alternatives: [
      { h: 'H5', text: 'Typing slip in the endings task (-en/-em differ by one letter).' },
    ],
  },
  R4: {
    title: 'den vs. dem, then mein-',
    hypothesis: 'H3',
    learner: 'The endings -en and -em may not yet be linked to the case — for articles and for mein-.',
    alternatives: [
      { h: 'H4', text: 'Possessive errors could be a separate gap that remains after the article practice.' },
    ],
  },
  R5: {
    title: 'Make it automatic',
    hypothesis: 'H5',
    learner: 'All the separate checks went well. The original error was probably a slip while writing freely.',
    alternatives: [
      { h: 'H2a', text: 'Controlled tasks may hide a gap that only shows in free production — the Transfer Check tests this.' },
    ],
  },
  R6: {
    title: 'Several connected gaps',
    hypothesis: null,
    learner: 'A few things contribute here. We will work on them one at a time — order based on your answers.',
    alternatives: [
      { h: '—', text: 'One gap may be causing the others; a later re-check could show fewer gaps than now.' },
    ],
  },
  R7: {
    title: 'Noun gender',
    hypothesis: 'H1',
    learner: 'Your answers suggest checking noun gender first.',
    alternatives: [
      { h: '—', text: 'Misclick: the original "meinen" is a masculine form, which contradicts a gender gap.' },
    ],
  },
  R8: {
    title: 'Not enough evidence yet',
    hypothesis: null,
    learner: 'Your answers point in more than one direction. We will practise lightly and check again later.',
    alternatives: [
      { h: '—', text: 'Any of the hypotheses for the unresolved skill.' },
    ],
  },
  R9: {
    title: 'Contradictory evidence',
    hypothesis: 'H3',
    learner: 'mein- went well, but den/dem did not. We are treating this with caution.',
    alternatives: [
      { h: '—', text: '"meinem" learned as a fixed chunk without the underlying rule.' },
      { h: 'H5', text: 'Slips on the article items.' },
    ],
  },
};
