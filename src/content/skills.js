// Micro-skills, hypotheses and their relations for ONE diagnostic scenario:
// "Ich helfe meinen Bruder." → "Ich helfe meinem Bruder."
// This is deliberately scenario-scoped — not a full skill map.

export const ORIGINAL_ERROR = {
  learner: 'Ich helfe meinen Bruder.',
  correct: 'Ich helfe meinem Bruder.',
  wrongPart: 'meinen',
  rightPart: 'meinem',
};

export const SKILLS = {
  G: {
    id: 'MS-G',
    name: 'Noun gender',
    learnerName: 'Noun gender',
    example: 'der Bruder · das Kind',
    hypothesis: 'H1',
  },
  V1: {
    id: 'MS-V1',
    name: 'helfen takes Dativ',
    learnerName: 'helfen + Dativ',
    example: 'Ich helfe meinem …',
    hypothesis: 'H2a',
  },
  V2: {
    id: 'MS-V2',
    name: 'Dativ verbs as a group',
    learnerName: 'Dativ verbs',
    example: 'danken, antworten, gratulieren',
    hypothesis: 'H2b',
  },
  A: {
    id: 'MS-A',
    name: 'Case → article ending',
    learnerName: 'den vs. dem',
    example: 'den (Akk) · dem (Dat)',
    hypothesis: 'H3',
  },
  P: {
    id: 'MS-P',
    name: 'Possessive in Dativ',
    learnerName: 'mein- → meinem',
    example: 'meinem Vater · meinen Vater',
    hypothesis: 'H4',
  },
  INT: {
    id: 'INT',
    name: 'Integration in free production',
    learnerName: 'Putting it together',
    example: 'Am Samstag helfe ich meinem Opa …',
    hypothesis: 'H5',
    pseudo: true, // not a micro-skill: the place where H5 lives
  },
};

export const SKILL_ORDER = ['G', 'V1', 'V2', 'A', 'P', 'INT'];

export const HYPOTHESES = {
  H1: {
    label: 'Gender of Bruder unknown',
    learner: "You may not be sure about the gender of the noun.",
    designer:
      'Low prior: "meinen" is the correct masculine Akkusativ form, and Bruder has natural gender. Kept as a short check, weighted low.',
    skill: 'G',
  },
  H2a: {
    label: 'helfen not linked to Dativ',
    learner: 'You may not yet link the verb helfen with Dativ.',
    designer: 'Lexical valency gap for one verb. Other Dativ verbs are sorted correctly.',
    skill: 'V1',
  },
  H2b: {
    label: 'Dativ verbs not yet a category',
    learner: 'Verbs like helfen, danken and antworten may not yet feel like one group.',
    designer: 'Category gap: single-object Dativ verbs are treated as Akkusativ verbs.',
    skill: 'V2',
  },
  H3: {
    label: 'Endings not mapped to case',
    learner: 'The endings -en and -em may not yet be linked to the case.',
    designer: 'Form–case mapping fails at article level (den/dem) even when the case is given.',
    skill: 'A',
  },
  H4: {
    label: 'Possessive Dativ form',
    learner: 'You know dem — but mein- does not follow the same pattern yet.',
    designer: 'Article mapping is solid; it does not transfer to possessive determiners (einem → meinem).',
    skill: 'P',
  },
  H5: {
    label: 'Slip / not yet automatic',
    learner: 'You know the rules — the slip probably happened while writing freely.',
    designer:
      'Hypothesis by exclusion: all components pass in controlled tasks. meinen/meinem are near-homophones.',
    skill: 'INT',
  },
};

// Relation types are shown separately in Designer View:
// - prerequisite: you learn A before B (B builds on A)
// - corequired:   both are needed at the same time to produce a sentence; neither builds on the other
// - instance:     one skill is a member of a broader one
export const RELATIONS = [
  { from: 'G', to: 'A', type: 'prerequisite', note: 'Gender decides which ending set applies (dem Vater vs. der Mutter).' },
  { from: 'A', to: 'P', type: 'prerequisite', note: 'mein- follows the ein-/article pattern: einem → meinem.' },
  { from: 'V1', to: 'V2', type: 'instance', note: 'helfen is one member of the Dativ verb group.' },
  { from: 'V1', to: 'INT', type: 'corequired', note: 'Choosing Dativ after helfen…' },
  { from: 'P', to: 'INT', type: 'corequired', note: '…and producing meinem are both needed at once.' },
  { from: 'G', to: 'INT', type: 'corequired', note: 'Masculine/neuter → -em; feminine would be -er.' },
];

export const RELATION_TYPES = {
  prerequisite: {
    label: 'Learning prerequisite',
    text: 'B builds on A. If both are weak, A is practised first.',
  },
  corequired: {
    label: 'Co-required in production',
    text: 'Both are needed at the same moment in a sentence. Neither builds on the other, so their order is decided from the evidence, not fixed.',
  },
  instance: {
    label: 'Member of a group',
    text: 'A single verb vs. the category it belongs to. Errors on one vs. many distinguish H2a from H2b.',
  },
};
