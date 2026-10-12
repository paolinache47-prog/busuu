import { Badge, Card, ConfidenceBadge, Eyebrow } from './ui.jsx';
import { SkillMap } from './SkillMap.jsx';
import { SKILLS, HYPOTHESES, RELATIONS, RELATION_TYPES } from '../content/skills.js';
import { DIAGNOSTIC_TASKS, EXTRA_CHECKS } from '../content/diagnostics.js';
import { PRACTICE_BLOCKS, ACTIVITY_TYPE_LABELS } from '../content/practice.js';
import { TRANSFER } from '../content/transfer.js';
import { ROUTES } from '../content/routes.js';
import { CONFIDENCE_RUBRIC, MAX_BLOCKS_PER_SESSION } from '../logic/routing.js';
import { STATUS_TEXT } from '../logic/explain.js';
import { planDiagnostic, SKIP_RULE, DIAGNOSTIC_MODE } from '../logic/plan.js';

const COLS = ['G', 'V1', 'V2', 'A', 'P', 'INT'];

const LIMITATIONS = [
  ['D2 depends on terminology', 'The sort uses wen?/wem? and Akkusativ/Dativ. A learner with implicit knowledge but no metalanguage may get a false gap. That is why routes based on D2 (R1, R2) are capped at medium confidence. Alternative under consideration: pronoun format (ihn/ihm), which mixes in form knowledge.'],
  ['D1 ceiling effect', 'Bruder has natural gender, so the item is almost always correct. D1 can rule H1 out cheaply but is weak evidence for it — hence R7 always requires an extra check.'],
  ['Screen 2 shows the correction', 'The brief shows "meinem Bruder" before the check, which may prime D4. Mitigation: D4 uses Vater/Kind and includes an Akkusativ control.'],
  ['Few items per skill', '2–3 items per skill keep the check short but allow guessing (50% on binary choices). Ambiguous patterns trigger an extra check instead of a decision.'],
  ['Transfer is string-matched', 'Only the determiner before the cue noun is checked against a predefined list. Word order, verb form and other words are not evaluated. This is not free-speech assessment.'],
  ['No L1 information', 'Russian speakers have "помогать кому" (Dativ), so H2a is less likely for them than for English speakers. The prototype does not use L1.'],
  ['One session only', 'No spaced evidence, so no skill can be "mastered". Statuses describe this session only.'],
  ['Simulated logic', 'All decisions are deterministic rules written by a designer. No AI model is involved.'],
];

function itemHypothesis(e) {
  const h = { G: 'H1', V1: 'H2a', V2: 'H2b', A: 'H3', P: 'H4' }[e.skill];
  if (e.control) return e.correct ? 'Control passed — rules out over-applying Dativ' : 'Control failed — over-application or guessing';
  return e.correct ? `Weakens ${h}` : `Supports ${h}`;
}

function matrixCell(task, skill) {
  if (task.skills?.includes(skill)) return 'direct';
  return '';
}

export function DesignerView({ state, route, scenario, transferInterp }) {
  const final = route?.stage === 'final';
  const diagStatus = state
    ? { G: tone(state.G.status), V1: state.V.evidence.find((e) => e.item === 'helfen').correct ? 'ok' : 'gap', V2: state.V.status === 'categoryGap' ? 'gap' : ['partial', 'unresolved'].includes(state.V.status) ? 'mixed' : 'ok', A: tone(state.A.status), P: tone(state.P.status), INT: 'none' }
    : {};
  const allEvidence = state
    ? [...state.G.evidence, ...state.V.evidence, ...state.A.evidence, ...state.P.evidence, ...['G', 'V', 'A', 'P'].flatMap((k) => (state[k].extra ? state[k].extra.evidence.map((e) => ({ ...e, task: EXTRA_CHECKS[k].id })) : []))]
    : [];

  return (
    <div className="designer">
      <div className="designer-head">
        <Eyebrow>Designer View</Eyebrow>
        <h1 className="h1">How the diagnosis decides</h1>
        <p className="muted">
          {scenario ? `Showing ${scenario.name} — ${scenario.tagline}.` : state ? 'Showing the current live session.' : 'No answers yet. Complete the check or load a learner scenario to see a live trace.'}
        </p>
      </div>

      {final && (
        <Card className="d-summary">
          <div className="d-sum-grid">
            <div>
              <span className="muted small">Route fired</span>
              <div className="d-big">{route.rule} · {route.copy.title}</div>
              {route.extraLog.length > 0 && (
                <span className="muted small">via extra check ({route.extraLog.map((x) => `${x.key}: ${STATUS_TEXT[x.before]} → ${x.outcome}`).join('; ')})</span>
              )}
            </div>
            <div>
              <span className="muted small">Working hypothesis</span>
              <div className="d-big">{route.hypotheses.length ? route.hypotheses.join(' + ') : '—'}</div>
              <span className="muted small">{route.hypotheses.map((h) => HYPOTHESES[h].label).join('; ') || 'none claimed'}</span>
            </div>
            <div>
              <span className="muted small">Confidence</span>
              <div><ConfidenceBadge level={route.confidence.level} /></div>
              <ul className="plain small">{route.confidence.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          </div>
        </Card>
      )}

      <div className="d-grid">
        <Card className="span-2">
          <h3 className="h3">Micro-skill map</h3>
          <p className="muted small">Colours show the diagnostic status of the current learner. Scoped to this one error — not a full skill map.</p>
          <SkillMap statuses={diagStatus} labels={state ? Object.fromEntries(Object.entries(diagStatus).filter(([k]) => k !== 'INT').map(([k, v]) => [k, { ok: 'clear', gap: 'gap', mixed: 'mixed', none: '' }[v]])) : {}} />
          <div className="rel-types">
            {Object.entries(RELATION_TYPES).map(([k, r]) => (
              <div key={k} className={`rel rel-${k}`}>
                <strong>{r.label}</strong>
                <p className="small">{r.text}</p>
                <ul className="plain small">
                  {RELATIONS.filter((x) => x.type === k).map((x, i) => (
                    <li key={i}><span className="mono">{SKILLS[x.from].id} → {SKILLS[x.to].id}</span> {x.note}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="span-2">
          <h3 className="h3">Which task measures which skill</h3>
          <div className="table-wrap">
            <table className="matrix">
              <thead>
                <tr><th>Task</th>{COLS.map((c) => <th key={c}>{SKILLS[c].id}</th>)}<th>Held constant</th></tr>
              </thead>
              <tbody>
                {DIAGNOSTIC_TASKS.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.id}</strong> {t.title}</td>
                    {COLS.map((c) => <td key={c} className={`cell-${matrixCell(t, c)}`}>{matrixCell(t, c) ? '●' : ''}</td>)}
                    <td className="small">{t.isolates}</td>
                  </tr>
                ))}
                {Object.values(EXTRA_CHECKS).map((t) => (
                  <tr key={t.id} className="sub">
                    <td><strong>{t.id}</strong> extra check</td>
                    {COLS.map((c) => <td key={c} className={`cell-${matrixCell(t, c)}`}>{matrixCell(t, c) ? '●' : ''}</td>)}
                    <td className="small">Only when evidence is mixed (R7/R8/R9)</td>
                  </tr>
                ))}
                {TRANSFER.slots.map((s) => (
                  <tr key={s.id} className="sub">
                    <td><strong>T-{s.id}</strong> transfer</td>
                    {COLS.map((c) => <td key={c} className={s.skills.includes(c) ? 'cell-co' : ''}>{s.skills.includes(c) ? '○' : ''}</td>)}
                    <td className="small">{s.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">● isolated measurement · ○ co-required in free production (several skills at once)</p>
        </Card>

        <Card className="span-2">
          <h3 className="h3">Evidence → hypotheses</h3>
          {state ? (
            <div className="table-wrap">
              <table className="ev-table">
                <thead><tr><th>Task</th><th>Item</th><th>Answer</th><th>Expected</th><th></th><th>Reading</th></tr></thead>
                <tbody>
                  {allEvidence.map((e, i) => (
                    <tr key={i} className={e.correct ? 'ok' : 'bad'}>
                      <td>{e.task}</td>
                      <td className="de">{e.prompt}{e.control && <Badge tone="neutral">control</Badge>}</td>
                      <td className="de">{e.given}</td>
                      <td className="de">{e.expected}</td>
                      <td>{e.correct ? '✓' : '✗'}</td>
                      <td className="small">{itemHypothesis(e)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="patterns small">
                {state.V.bias && <p><strong>D2:</strong> {state.V.bias}</p>}
                <p><strong>D3 pattern:</strong> {state.A.pattern.text}</p>
                <p><strong>D4 pattern:</strong> {state.P.pattern.text}</p>
                {state.G.note && <p><strong>D1:</strong> {state.G.note}</p>}
              </div>
            </div>
          ) : <p className="muted">No evidence yet.</p>}
        </Card>

        <Card>
          <h3 className="h3">Routing trace</h3>
          <p className="muted small">Ordered rules, first match wins. Mixed evidence never routes directly: it triggers an extra check first.</p>
          {route?.stage === 'pending' && (
            <div className="pending">
              <strong>Waiting for extra check</strong>
              <ul className="plain small">{route.pending.map((p) => <li key={p.key}>{p.rule}: {p.why}</li>)}</ul>
            </div>
          )}
          <ol className="trace">
            {(route?.trace || Object.keys(ROUTES).map((id) => ({ id, cond: '', matched: false }))).map((r) => (
              <li key={r.id} className={`${r.fired ? 'fired' : ''} ${r.matched ? 'matched' : ''}`}>
                <span className="mono">{r.id}</span>
                <span className="small">{r.cond || ROUTES[r.id].title}</span>
                <span className="small tr-state">{r.fired ? 'fired' : r.matched ? 'matched (lower priority)' : ''}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <h3 className="h3">Why this practice</h3>
          {final ? (
            <>
              <p>{route.reason}</p>
              <ol className="plain">
                {route.blocks.map((b) => (
                  <li key={b}>
                    <strong>{b} · {PRACTICE_BLOCKS[b].title}</strong>{route.light.includes(b) && ' (light)'}
                    <p className="small muted">{PRACTICE_BLOCKS[b].designerNote}</p>
                    <p className="small">Activities: {PRACTICE_BLOCKS[b].activities.map((a) => ACTIVITY_TYPE_LABELS[a.type]).join(' → ')}</p>
                  </li>
                ))}
              </ol>
              {route.deferred.length > 0 && <p className="small">Deferred (max {MAX_BLOCKS_PER_SESSION} blocks per session): {route.deferred.join(', ')}. Full lesson recommended.</p>}
            </>
          ) : <p className="muted">Available once the route is final.</p>}
          <h4 className="h4">Alternatives still possible</h4>
          {final ? <ul className="plain small">{route.copy.alternatives.map((a) => <li key={a.text}><span className="mono">{a.h}</span> {a.text}</li>)}</ul> : <p className="muted small">—</p>}
        </Card>

        {transferInterp && transferInterp.outcome !== 'incomplete' && (
          <Card className="span-2">
            <h3 className="h3">Transfer interpretation</h3>
            <p><Badge tone="info">{transferInterp.outcome}</Badge> {transferInterp.text}</p>
            <p className="small">{transferInterp.cNote}</p>
            <p className="small muted">Rules: A✓ B✓ → confirmed · A✓ B✗ → over-generalisation → contrast practice · A✗ after R5 → supports H5 · A✗ otherwise → re-diagnose next session. Slot C is informative only.</p>
          </Card>
        )}

        <Card>
          <h3 className="h3">Confidence rubric</h3>
          <p className="muted small">Qualitative on purpose — no percentages. The item counts are too small for a probability to mean anything.</p>
          <ul className="plain">
            {CONFIDENCE_RUBRIC.map((c) => <li key={c.level}><ConfidenceBadge level={c.level} /> <span className="small">{c.text}</span></li>)}
          </ul>
        </Card>

        <Card>
          <h3 className="h3">Diagnostic plan</h3>
          <p className="small">Mode: <span className="mono">{DIAGNOSTIC_MODE}</span>. All four tasks always run in this demo.</p>
          <p className="small muted">Ready for shortening: {SKIP_RULE} The plan function already accepts prior evidence; it is simply empty here.</p>
          <ul className="plain small">
            {planDiagnostic({ mode: 'adaptive', priorEvidence: { G: { sessions: 3, consistent: true } } }).map((p) => (
              <li key={p.task.id}><span className="mono">{p.task.id}</span> {p.include ? 'include' : 'skip'} — {p.why}</li>
            ))}
          </ul>
          <p className="small muted">Example above: adaptive mode with consistent gender evidence from 3 earlier sessions.</p>
        </Card>

        <Card className="span-2">
          <h3 className="h3">Limitations of this diagnostic</h3>
          <div className="limits">
            {LIMITATIONS.map(([t, d]) => (
              <div key={t}><strong>{t}</strong><p className="small">{d}</p></div>
            ))}
          </div>
        </Card>

        <Card className="span-2">
          <h3 className="h3">All routes</h3>
          <div className="table-wrap">
            <table className="matrix">
              <thead><tr><th>Route</th><th>Hypothesis</th><th>Learner message</th></tr></thead>
              <tbody>
                {Object.entries(ROUTES).map(([id, r]) => (
                  <tr key={id} className={route?.rule === id ? 'hl-row' : ''}>
                    <td><strong>{id}</strong> {r.title}</td>
                    <td>{r.hypothesis || '—'}</td>
                    <td className="small">{r.learner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function tone(s) {
  return { ok: 'ok', gap: 'gap', partial: 'mixed', unresolved: 'mixed' }[s] || 'none';
}
