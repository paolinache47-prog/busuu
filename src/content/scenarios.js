// Pre-recorded learner answers. They run through exactly the same scoring
// and routing as live answers — nothing about the result is hard-coded here.

const ALL_CORRECT = {
  D1: { g1: 'der', g2: 'die', g3: 'das' },
  D2: { helfen: 'dat', besuchen: 'akk', danken: 'dat', fragen: 'akk', antworten: 'dat', sehen: 'akk' },
  D3: { a1: 'dem', a2: 'den', a3: 'dem' },
  D4: { p1: 'em', p2: 'en', p3: 'em' },
};

const with_ = (patch) => ({
  D1: { ...ALL_CORRECT.D1, ...patch.D1 },
  D2: { ...ALL_CORRECT.D2, ...patch.D2 },
  D3: { ...ALL_CORRECT.D3, ...patch.D3 },
  D4: { ...ALL_CORRECT.D4, ...patch.D4 },
});

export const SCENARIOS = [
  {
    id: 'A',
    name: 'Learner A',
    tagline: 'Does not link helfen with Dativ',
    expected: 'R1',
    answers: with_({ D2: { helfen: 'akk' } }),
    extra: {},
    transfer: {
      A: 'Am Samstag helfe ich meinem Opa im Garten.',
      B: 'Am Sonntag besuche ich meinen Onkel.',
      C: 'Am Montag antworte ich meinem Chef.',
    },
  },
  {
    id: 'B',
    name: 'Learner B',
    tagline: 'Struggles with the Dativ verb group',
    expected: 'R2',
    answers: with_({ D2: { helfen: 'akk', danken: 'akk', antworten: 'akk' } }),
    extra: {},
    transfer: {
      A: 'Am Samstag helfe ich meinem Opa im Garten.',
      B: 'Am Sonntag besuche ich meinen Onkel.',
      C: 'Am Montag antworte ich meinen Chef.',
    },
  },
  {
    id: 'C',
    name: 'Learner C',
    tagline: 'Knows the case, misses the mein- ending',
    expected: 'R3',
    answers: with_({ D4: { p1: 'en', p3: 'en' } }),
    extra: {},
    transfer: {
      A: 'Am Samstag helfe ich meinem Opa im Garten.',
      B: 'Am Sonntag besuche ich meinem Onkel.',
      C: 'Am Montag antworte ich meinem Chef.',
    },
  },
  {
    id: 'D',
    name: 'Learner D',
    tagline: 'Several connected difficulties',
    expected: 'R6',
    answers: with_({
      D2: { helfen: 'akk', danken: 'akk' },
      D3: { a1: 'den', a3: 'den' },
      D4: { p1: 'en', p3: 'en' },
    }),
    extra: {},
    transfer: {
      A: 'Am Samstag helfe ich meinem Opa im Garten.',
      B: 'Am Sonntag besuche ich meinen Onkel.',
      C: 'Am Montag antworte ich meinen Chef.',
    },
  },
  {
    id: 'E',
    name: 'Learner E',
    tagline: 'Correct in controlled tasks, slips in free writing',
    expected: 'R5',
    answers: with_({}),
    extra: {},
    transfer: {
      A: 'Am Samstag helfe ich meinen Opa im Garten.',
      B: 'Am Sonntag besuche ich meinen Onkel.',
      C: 'Am Montag antworte ich meinen Chef.',
    },
  },
  {
    id: 'F',
    name: 'Learner F',
    tagline: 'Mixed answers — ambiguity handling',
    expected: 'R8',
    extraScenario: true,
    answers: with_({ D3: { a3: 'den' }, D4: { p3: 'en' } }),
    extra: {
      A: { xa1: 'dem', xa2: 'den' },
      P: { xp1: 'en', xp2: 'en' },
    },
    transfer: {
      A: 'Am Samstag helfe ich meinem Opa im Garten.',
      B: 'Am Sonntag besuche ich meinen Onkel.',
      C: 'Am Montag antworte ich meinem Chef.',
    },
  },
  {
    id: 'G',
    name: 'Learner G',
    tagline: 'Gender answer contradicts the original error',
    expected: 'R7 → R3',
    extraScenario: true,
    answers: with_({ D1: { g1: 'die', g3: 'der' }, D4: { p1: 'en', p3: 'en' } }),
    extra: {
      G: { xg1: 'der', xg2: 'die' },
    },
    transfer: {
      A: 'Am Samstag helfe ich meinem Opa im Garten.',
      B: 'Am Sonntag besuche ich meinen Onkel.',
      C: 'Am Montag antworte ich meinem Chef.',
    },
  },
];
