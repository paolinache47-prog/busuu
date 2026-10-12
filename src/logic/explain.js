// Builds short, evidence-based explanations from the scored state.

const correctCount = (ev) => ev.filter((e) => e.correct).length;

export function evidenceSummary(state) {
  const { G, V, A, P } = state;
  const lines = [];

  const g = correctCount(G.evidence);
  const bruder = G.evidence.find((e) => e.key);
  lines.push({
    key: 'G',
    task: 'D1',
    label: 'Noun gender',
    tone: G.status === 'ok' ? 'pos' : 'neg',
    text: G.status === 'ok' ? `${g}/${G.total} articles correct` : `${bruder.correct ? 'Bruder correct, but ' : `Bruder → ${bruder.given}; `}${g}/${G.total} correct`,
  });

  const helfen = V.evidence.find((e) => e.item === 'helfen');
  const datWrong = V.evidence.filter((e) => !e.control && !e.correct).map((e) => e.prompt);
  const ctrlWrong = V.evidence.filter((e) => e.control && !e.correct).map((e) => e.prompt);
  let vText;
  if (V.bias) vText = V.bias;
  else if (!datWrong.length && !ctrlWrong.length) vText = 'All 6 verbs sorted correctly';
  else {
    const parts = [];
    if (datWrong.length) parts.push(`${datWrong.join(', ')} → wen?`);
    if (ctrlWrong.length) parts.push(`${ctrlWrong.join(', ')} → wem?`);
    vText = parts.join(' · ') + (helfen.correct ? ' (helfen correct)' : '');
  }
  lines.push({ key: 'V', task: 'D2', label: 'Verb sort', tone: V.status === 'ok' ? 'pos' : V.status === 'partial' ? 'mixed' : 'neg', text: vText });

  lines.push({
    key: 'A',
    task: 'D3',
    label: 'Articles, case given',
    tone: A.status === 'ok' ? 'pos' : A.status === 'partial' ? 'mixed' : 'neg',
    text: `${correctCount(A.evidence)}/${A.total} correct${A.errors ? ' — ' + wrongList(A.evidence) : ''}`,
  });

  lines.push({
    key: 'P',
    task: 'D4',
    label: 'mein- endings, case given',
    tone: P.status === 'ok' ? 'pos' : P.status === 'partial' ? 'mixed' : 'neg',
    text: `${correctCount(P.evidence)}/${P.total} correct${P.errors ? ' — ' + wrongList(P.evidence) : ''}`,
  });

  for (const k of ['G', 'V', 'A', 'P']) {
    const x = state[k].extra;
    if (!x) continue;
    lines.push({
      key: k,
      task: 'Extra',
      label: `Extra check · ${{ G: 'gender', V: 'verb sort', A: 'articles', P: 'mein- endings' }[k]}`,
      tone: x.outcome === 'clean' ? 'pos' : x.outcome === 'confirmed' ? 'neg' : 'mixed',
      text: `${correctCount(x.evidence)}/${x.evidence.length} correct — ${
        x.outcome === 'clean' ? 'earlier error not confirmed' : x.outcome === 'confirmed' ? 'gap confirmed' : 'still mixed'
      }`,
    });
  }
  return lines;
}

function wrongList(ev) {
  return ev
    .filter((e) => !e.correct)
    .map((e) => e.prompt.replace(/\w*___/, e.given))
    .join(', ');
}

export const STATUS_TEXT = {
  ok: 'Clear',
  partial: 'Mixed',
  gap: 'Gap',
  unresolved: 'Unresolved',
  helfenGap: 'Gap: helfen only',
  categoryGap: 'Gap: verb group',
};
