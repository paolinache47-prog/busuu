// Micro-practice blocks P0–P5. Each block: notice → contrast → apply,
// with at least two different activity types.

export const PRACTICE_BLOCKS = {
  P0: {
    id: 'P0',
    title: 'Noun gender: family words',
    goal: 'Know der, die or das for family nouns.',
    skills: ['G'],
    designerNote:
      'Only after a confirmed gender gap (R7). Natural gender helps for most items; Kind and Baby are neuter and break the "gender = sex" shortcut.',
    activities: [
      {
        id: 'P0-a1',
        type: 'choice',
        label: 'Choose',
        instruction: 'Choose the article.',
        items: [
          { id: 'o1', prompt: '___ Onkel', options: ['der', 'die', 'das'], answer: 'der' },
          { id: 'o2', prompt: '___ Tante', options: ['der', 'die', 'das'], answer: 'die' },
          { id: 'o3', prompt: '___ Opa', options: ['der', 'die', 'das'], answer: 'der' },
          { id: 'o4', prompt: '___ Kind', options: ['der', 'die', 'das'], answer: 'das', hint: 'Kind is neuter — even though it is a person.' },
        ],
      },
      {
        id: 'P0-a2',
        type: 'sort',
        label: 'Sort',
        instruction: 'Put each noun in its column.',
        columns: [
          { id: 'der', label: 'der' },
          { id: 'die', label: 'die' },
          { id: 'das', label: 'das' },
        ],
        items: [
          { id: 'vater', text: 'Vater', answer: 'der' },
          { id: 'mutter', text: 'Mutter', answer: 'die' },
          { id: 'bruder', text: 'Bruder', answer: 'der' },
          { id: 'schwester', text: 'Schwester', answer: 'die' },
          { id: 'kind', text: 'Kind', answer: 'das' },
          { id: 'baby', text: 'Baby', answer: 'das' },
        ],
        explain: 'Most family words follow natural gender. Kind and Baby are neuter.',
      },
    ],
  },

  P1: {
    id: 'P1',
    title: 'helfen + wem?',
    goal: 'helfen always asks wem? — so the person is in Dativ.',
    skills: ['V1'],
    designerNote:
      'Lexical gap for one verb. Input first (chunks with mir/dir/meinem), then a contrast with an Akkusativ verb, then guided production. hilfst/hilft are avoided on purpose (stem-vowel change is a different skill).',
    activities: [
      {
        id: 'P1-a1',
        type: 'notice',
        label: 'Notice',
        instruction: 'Tap the person who gets the help.',
        sentences: [
          { tokens: ['Kannst', 'du', 'mir', 'helfen?'], targets: [2] },
          { tokens: ['Ich', 'helfe', 'dir', 'gern.'], targets: [2] },
          { tokens: ['Am', 'Wochenende', 'helfe', 'ich', 'meinem', 'Vater', 'im', 'Garten.'], targets: [4, 5] },
        ],
        explain: 'mir, dir, meinem Vater — all Dativ. helfen asks wem?',
      },
      {
        id: 'P1-a2',
        type: 'choice',
        label: 'Contrast',
        instruction: 'Which form fits?',
        items: [
          { id: 'c1', prompt: 'Ich besuche ___ Opa.', options: ['meinen', 'meinem'], answer: 'meinen', hint: 'besuchen → wen? → Akkusativ.' },
          { id: 'c2', prompt: 'Ich helfe ___ Opa.', options: ['meinen', 'meinem'], answer: 'meinem', hint: 'helfen → wem? → Dativ.' },
          { id: 'c3', prompt: 'Ich helfe ___ Kind.', options: ['mein', 'meinem'], answer: 'meinem', hint: 'helfen → wem? → Dativ: meinem Kind.' },
          { id: 'c4', prompt: 'Ich sehe ___ Vater.', options: ['meinen', 'meinem'], answer: 'meinen', hint: 'sehen → wen? → Akkusativ.' },
        ],
      },
      {
        id: 'P1-a3',
        type: 'build',
        label: 'Build',
        instruction: 'Build the sentence from the cue.',
        cue: 'ich · helfen · mein Freund · beim Umzug',
        tiles: ['beim Umzug', 'meinen', 'Ich', 'Freund', 'meinem', 'helfe'],
        answer: ['Ich', 'helfe', 'meinem', 'Freund', 'beim Umzug'],
        hints: [
          { when: 'meinen', text: 'helfen → wem? Which ending shows Dativ?' },
          { default: true, text: 'Verb in second position: Ich helfe …' },
        ],
      },
    ],
  },

  P2: {
    id: 'P2',
    title: 'Verbs that ask wem?',
    goal: 'helfen, danken, antworten, gratulieren — one group, all Dativ.',
    skills: ['V2', 'V1'],
    designerNote:
      'Category gap. Builds the group explicitly, contrasts with frequent Akkusativ verbs, then produces forms. The sort repeats D2-style metalanguage, so a short wem?/wen? anchor is shown.',
    activities: [
      {
        id: 'P2-a1',
        type: 'sort',
        label: 'Sort',
        instruction: 'Sort the verbs. Ask yourself: wen? or wem?',
        columns: [
          { id: 'akk', label: 'wen?', sub: 'Akkusativ' },
          { id: 'dat', label: 'wem?', sub: 'Dativ' },
        ],
        items: [
          { id: 'helfen', text: 'helfen', answer: 'dat' },
          { id: 'besuchen', text: 'besuchen', answer: 'akk' },
          { id: 'danken', text: 'danken', answer: 'dat' },
          { id: 'fragen', text: 'fragen', answer: 'akk' },
          { id: 'antworten', text: 'antworten', answer: 'dat' },
          { id: 'kennen', text: 'kennen', answer: 'akk' },
          { id: 'gratulieren', text: 'gratulieren', answer: 'dat' },
          { id: 'sehen', text: 'sehen', answer: 'akk' },
        ],
        explain: 'helfen, danken, antworten, gratulieren: the person answers wem? → Dativ.',
      },
      {
        id: 'P2-a2',
        type: 'choice',
        label: 'Contrast',
        instruction: 'Same person, different verb. Which form fits?',
        items: [
          { id: 'm1', prompt: 'Ich frage ___ Lehrer.', options: ['meinen', 'meinem'], answer: 'meinen', hint: 'fragen → wen?' },
          { id: 'm2', prompt: 'Ich antworte ___ Lehrer.', options: ['meinen', 'meinem'], answer: 'meinem', hint: 'antworten → wem?' },
          { id: 'm3', prompt: 'Ich danke ___ Chef.', options: ['meinen', 'meinem'], answer: 'meinem', hint: 'danken → wem?' },
          { id: 'm4', prompt: 'Ich besuche ___ Chef.', options: ['meinen', 'meinem'], answer: 'meinen', hint: 'besuchen → wen?' },
        ],
      },
      {
        id: 'P2-a3',
        type: 'type',
        label: 'Write',
        instruction: 'Type the missing word.',
        items: [
          { id: 't1', before: 'Ich danke', after: 'Chef.', cue: 'der', accept: ['dem'], hint: 'danken → wem? → der becomes …' },
          { id: 't2', before: 'Wir gratulieren', after: 'Kind.', cue: 'mein-', accept: ['meinem'], hint: 'gratulieren → wem? → mein- + -em' },
          { id: 't3', before: 'Ich helfe', after: 'Opa.', cue: 'mein-', accept: ['meinem'], hint: 'helfen → wem?' },
        ],
      },
    ],
  },

  P3: {
    id: 'P3',
    title: 'mein- → meinem',
    goal: 'mein- takes the same ending as ein-: einem → meinem.',
    skills: ['P'],
    designerNote:
      'Article mapping is in place; the gap is the transfer to possessives. Pattern discovery via ein-, transformation, then a mixed set with Akkusativ items so "-em everywhere" is not rewarded.',
    activities: [
      {
        id: 'P3-a1',
        type: 'choice',
        label: 'Pattern',
        instruction: 'mein- copies the ending of ein-. Complete the pattern.',
        items: [
          { id: 'e1', prompt: 'einem Freund → mein___ Freund', options: ['-e', '-en', '-em'], answer: '-em' },
          { id: 'e2', prompt: 'einen Freund → mein___ Freund', options: ['-e', '-en', '-em'], answer: '-en' },
          { id: 'e3', prompt: 'einem Kind → dein___ Kind', options: ['-e', '-en', '-em'], answer: '-em', hint: 'Same pattern for dein-.' },
        ],
      },
      {
        id: 'P3-a2',
        type: 'type',
        label: 'Transform',
        instruction: 'Replace the article with the possessive.',
        items: [
          { id: 'r1', before: 'dem Vater →', after: 'Vater', cue: 'mein-', accept: ['meinem'], hint: 'dem → -em → mein + em' },
          { id: 'r2', before: 'dem Kind →', after: 'Kind', cue: 'dein-', accept: ['deinem'], hint: 'dem → -em → dein + em' },
          { id: 'r3', before: 'einem Freund →', after: 'Freund', cue: 'mein-', accept: ['meinem'] },
        ],
      },
      {
        id: 'P3-a3',
        type: 'choice',
        label: 'Mixed',
        instruction: 'Careful: not every sentence needs Dativ.',
        items: [
          { id: 'x1', prompt: 'Ich sehe ___ Vater.', options: ['meinen', 'meinem'], answer: 'meinen', hint: 'sehen → wen? → Akkusativ.' },
          { id: 'x2', prompt: 'Ich helfe ___ Vater.', options: ['meinen', 'meinem'], answer: 'meinem' },
          { id: 'x3', prompt: 'Ich danke ___ Kind.', options: ['meinen', 'meinem'], answer: 'meinem' },
          { id: 'x4', prompt: 'Ich frage ___ Bruder.', options: ['meinen', 'meinem'], answer: 'meinen', hint: 'fragen → wen? → Akkusativ.' },
        ],
      },
    ],
  },

  P4: {
    id: 'P4',
    title: 'den or dem?',
    goal: 'Dativ masculine and neuter end in -m: dem.',
    skills: ['A'],
    designerNote:
      'Form–case mapping at article level. Notice the -m signal, practise with the case given, then with the case implied by a known verb.',
    activities: [
      {
        id: 'P4-a1',
        type: 'notice',
        label: 'Notice',
        instruction: 'Tap every article in Dativ. Some sentences have none.',
        sentences: [
          { tokens: ['Ich', 'kenne', 'den', 'Mann.'], targets: [] },
          { tokens: ['Ich', 'danke', 'dem', 'Mann.'], targets: [2] },
          { tokens: ['Ich', 'sehe', 'das', 'Kind.'], targets: [] },
          { tokens: ['Ich', 'helfe', 'dem', 'Kind.'], targets: [2] },
        ],
        explain: 'Dativ masculine and neuter: dem — the -m is the signal.',
      },
      {
        id: 'P4-a2',
        type: 'choice',
        label: 'Case given',
        instruction: 'The case is given. Choose the article.',
        items: [
          { id: 'l1', label: 'Dativ', prompt: '___ Mann', options: ['den', 'dem'], answer: 'dem' },
          { id: 'l2', label: 'Akkusativ', prompt: '___ Mann', options: ['den', 'dem'], answer: 'den' },
          { id: 'l3', label: 'Dativ', prompt: '___ Kind', options: ['das', 'dem'], answer: 'dem' },
          { id: 'l4', label: 'Akkusativ', prompt: '___ Lehrer', options: ['den', 'dem'], answer: 'den' },
          { id: 'l5', label: 'Dativ', prompt: '___ Lehrer', options: ['den', 'dem'], answer: 'dem' },
          { id: 'l6', label: 'Dativ', prompt: '___ Baby', options: ['das', 'dem'], answer: 'dem' },
        ],
      },
      {
        id: 'P4-a3',
        type: 'type',
        label: 'In a sentence',
        instruction: 'Now the verb tells you the case. Type the article.',
        items: [
          { id: 's1', before: 'Ich danke', after: 'Lehrer.', cue: 'der', accept: ['dem'], hint: 'danken → wem? → Dativ → -m' },
          { id: 's2', before: 'Ich frage', after: 'Lehrer.', cue: 'der', accept: ['den'], hint: 'fragen → wen? → Akkusativ → -n' },
          { id: 's3', before: 'Ich helfe', after: 'Kind.', cue: 'das', accept: ['dem'], hint: 'helfen → wem? → Dativ → -m' },
          { id: 's4', before: 'Ich sehe', after: 'Mann.', cue: 'der', accept: ['den'] },
        ],
      },
    ],
  },

  P5: {
    id: 'P5',
    title: 'Make it automatic',
    goal: 'You know the rule. Now make it fast — and check before you send.',
    skills: ['INT'],
    designerNote:
      'No rule re-teaching. Hearing -m vs -n, timed retrieval, and a self-monitoring routine on the learner’s own sentence. In the listening task the verb also cues the case — this is integrated practice, not pure phoneme discrimination.',
    activities: [
      {
        id: 'P5-a1',
        type: 'listen',
        label: 'Listen',
        instruction: 'Play each sentence. Which form do you hear?',
        options: ['meinen', 'meinem'],
        items: [
          { id: 'h1', sentence: 'Ich helfe meinem Bruder.', answer: 'meinem' },
          { id: 'h2', sentence: 'Ich sehe meinen Bruder.', answer: 'meinen' },
          { id: 'h3', sentence: 'Ich danke meinem Lehrer.', answer: 'meinem' },
          { id: 'h4', sentence: 'Ich frage meinen Lehrer.', answer: 'meinen' },
          { id: 'h5', sentence: 'Ich besuche meinen Vater.', answer: 'meinen' },
          { id: 'h6', sentence: 'Ich antworte meinem Vater.', answer: 'meinem' },
        ],
      },
      {
        id: 'P5-a2',
        type: 'speed',
        label: 'Quick answers',
        instruction: 'Answer before the timer runs out.',
        seconds: 7,
        items: [
          { id: 'q1', question: 'Wem hilfst du?', options: ['Ich helfe meinem Vater.', 'Ich helfe meinen Vater.'], answer: 'Ich helfe meinem Vater.' },
          { id: 'q2', question: 'Wen besuchst du?', options: ['Ich besuche meinem Freund.', 'Ich besuche meinen Freund.'], answer: 'Ich besuche meinen Freund.' },
          { id: 'q3', question: 'Wem dankst du?', options: ['Ich danke meinem Lehrer.', 'Ich danke meinen Lehrer.'], answer: 'Ich danke meinem Lehrer.' },
          { id: 'q4', question: 'Wen fragst du?', options: ['Ich frage meinen Lehrer.', 'Ich frage meinem Lehrer.'], answer: 'Ich frage meinen Lehrer.' },
        ],
      },
      {
        id: 'P5-a3',
        type: 'edit',
        label: 'Self-check',
        instruction: 'Your check before sending: helfen → wem? → -m. Fix your original sentence.',
        original: 'Ich helfe meinen Bruder.',
        accept: ['Ich helfe meinem Bruder.'],
        hint: 'Look at the ending of mein-.',
      },
    ],
  },
};

export const ACTIVITY_TYPE_LABELS = {
  notice: 'Noticing (tap in context)',
  choice: 'Choice with corrective feedback',
  sort: 'Categorisation',
  build: 'Sentence building',
  type: 'Gap fill / transformation',
  listen: 'Listening discrimination',
  speed: 'Timed retrieval',
  edit: 'Self-correction',
};
