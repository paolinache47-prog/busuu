// Transfer Check: a new communicative context. Only the target noun phrase is scored.
// Accepted determiners are pre-defined; the app does not evaluate free speech as a whole.

export const TRANSFER = {
  context: {
    from: 'Lena',
    message: 'Hey! Was machst du am Wochenende?',
    task: 'Reply to Lena. Write one sentence for each cue.',
  },
  slots: [
    {
      id: 'A',
      cue: ['Samstag', 'Opa', 'im Garten', 'helfen'],
      model: 'Am Samstag helfe ich meinem Opa im Garten.',
      noun: 'Opa',
      expectedCase: 'Dativ',
      accept: ['meinem', 'dem', 'unserem'],
      verbStems: ['helf', 'hilf'],
      skills: ['G', 'V1', 'P', 'INT'],
      role: 'Target skill in a new context (new noun, free sentence).',
    },
    {
      id: 'B',
      cue: ['Sonntag', 'Onkel', 'besuchen'],
      model: 'Am Sonntag besuche ich meinen Onkel.',
      noun: 'Onkel',
      expectedCase: 'Akkusativ',
      accept: ['meinen', 'den', 'unseren'],
      verbStems: ['besuch'],
      skills: ['P'],
      role: 'Akkusativ control: catches "-em everywhere" (a false success).',
    },
    {
      id: 'C',
      cue: ['Montag', 'Chef', 'antworten'],
      model: 'Am Montag antworte ich meinem Chef.',
      noun: 'Chef',
      expectedCase: 'Dativ',
      accept: ['meinem', 'dem', 'unserem'],
      verbStems: ['antwort'],
      skills: ['V2', 'P', 'INT'],
      role: 'Far transfer: another Dativ verb. Informative, not decisive.',
    },
  ],
};
