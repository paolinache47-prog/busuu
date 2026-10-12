// Diagnostic content (D1–D4 + extra-check items). No scoring logic here —
// see src/logic/scoring.js. Each item names the micro-skill it evidences.

export const DIAGNOSTIC_TASKS = [
  {
    id: 'D1',
    type: 'choice',
    skills: ['G'],
    title: 'Which article?',
    instruction: 'Choose the article for each noun.',
    options: ['der', 'die', 'das'],
    items: [
      { id: 'g1', prompt: '___ Bruder', answer: 'der', skill: 'G', key: true },
      { id: 'g2', prompt: '___ Schwester', answer: 'die', skill: 'G' },
      { id: 'g3', prompt: '___ Kind', answer: 'das', skill: 'G' },
    ],
    isolates: 'Case — Nominativ only. Kind is included because D3/D4 use a neuter noun.',
  },
  {
    id: 'D2',
    type: 'sort',
    skills: ['V1', 'V2'],
    title: 'Sort the verbs',
    instruction: 'Which question does the person after the verb answer?',
    columns: [
      { id: 'akk', label: 'wen?', sub: 'Akkusativ' },
      { id: 'dat', label: 'wem?', sub: 'Dativ' },
    ],
    items: [
      { id: 'helfen', text: 'helfen', answer: 'dat', skill: 'V1', key: true },
      { id: 'besuchen', text: 'besuchen', answer: 'akk', skill: 'V2', control: true },
      { id: 'danken', text: 'danken', answer: 'dat', skill: 'V2' },
      { id: 'fragen', text: 'fragen', answer: 'akk', skill: 'V2', control: true },
      { id: 'antworten', text: 'antworten', answer: 'dat', skill: 'V2' },
      { id: 'sehen', text: 'sehen', answer: 'akk', skill: 'V2', control: true },
    ],
    isolates: 'Forms — the learner does not decline anything.',
  },
  {
    id: 'D3',
    type: 'choice',
    skills: ['A'],
    title: 'Pick the article',
    instruction: 'The case is given. Choose the article.',
    options: ['der', 'das', 'den', 'dem'],
    items: [
      { id: 'a1', case: 'Dativ', prompt: '___ Lehrer', answer: 'dem', skill: 'A' },
      { id: 'a2', case: 'Akkusativ', prompt: '___ Lehrer', answer: 'den', skill: 'A', control: true },
      { id: 'a3', case: 'Dativ', prompt: '___ Kind', answer: 'dem', skill: 'A' },
    ],
    isolates: 'Case selection — the case is given in the label.',
  },
  {
    id: 'D4',
    type: 'ending',
    skills: ['P'],
    title: 'Complete the ending',
    instruction: 'The case is given. Type the ending.',
    stem: 'mein',
    items: [
      { id: 'p1', case: 'Dativ', noun: 'Vater', answer: 'em', skill: 'P' },
      { id: 'p2', case: 'Akkusativ', noun: 'Vater', answer: 'en', skill: 'P', control: true },
      { id: 'p3', case: 'Dativ', noun: 'Kind', answer: 'em', skill: 'P' },
    ],
    isolates: 'Case selection (given); Bruder is avoided so the learner cannot reuse the shown correction.',
  },
];

// Extra-check items used when evidence is mixed (R7, R8, R9).
// Two items per skill: they confirm, overturn, or leave the result unresolved.
export const EXTRA_CHECKS = {
  G: {
    id: 'X-G',
    type: 'choice',
    skills: ['G'],
    title: 'Which article?',
    instruction: 'Two more nouns.',
    options: ['der', 'die', 'das'],
    items: [
      { id: 'xg1', prompt: '___ Onkel', answer: 'der', skill: 'G' },
      { id: 'xg2', prompt: '___ Tante', answer: 'die', skill: 'G' },
    ],
  },
  V: {
    id: 'X-V',
    type: 'sort',
    skills: ['V2'],
    title: 'Sort two more verbs',
    instruction: 'Which question does the person after the verb answer?',
    columns: [
      { id: 'akk', label: 'wen?', sub: 'Akkusativ' },
      { id: 'dat', label: 'wem?', sub: 'Dativ' },
    ],
    items: [
      { id: 'gratulieren', text: 'gratulieren', answer: 'dat', skill: 'V2' },
      { id: 'kennen', text: 'kennen', answer: 'akk', skill: 'V2', control: true },
    ],
  },
  A: {
    id: 'X-A',
    type: 'choice',
    skills: ['A'],
    title: 'Pick the article',
    instruction: 'The case is given. Choose the article.',
    options: ['der', 'das', 'den', 'dem'],
    items: [
      { id: 'xa1', case: 'Dativ', prompt: '___ Mann', answer: 'dem', skill: 'A' },
      { id: 'xa2', case: 'Akkusativ', prompt: '___ Mann', answer: 'den', skill: 'A', control: true },
    ],
  },
  P: {
    id: 'X-P',
    type: 'ending',
    skills: ['P'],
    title: 'Complete the ending',
    instruction: 'The case is given. Type the ending.',
    stem: 'mein',
    items: [
      { id: 'xp1', case: 'Dativ', noun: 'Sohn', answer: 'em', skill: 'P' },
      { id: 'xp2', case: 'Akkusativ', noun: 'Freund', answer: 'en', skill: 'P', control: true },
    ],
  },
};
