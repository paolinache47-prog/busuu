import { useState } from 'react';
import { Badge, Button, Card, CaseTag, ConfidenceBadge, Disclosure, Eyebrow } from './ui.jsx';
import { ChoiceRows, EndingRows, SortBoard, isTaskComplete } from './tasks.jsx';
import { Activity } from './activities.jsx';
import { SkillMap } from './SkillMap.jsx';
import { ORIGINAL_ERROR, HYPOTHESES, SKILLS, SKILL_ORDER } from '../content/skills.js';
import { PRACTICE_BLOCKS } from '../content/practice.js';
import { TRANSFER } from '../content/transfer.js';
import { evidenceSummary } from '../logic/explain.js';
import { PROFILE_STATUSES } from '../logic/profile.js';
import { ERROR_TEXT } from '../logic/transfer.js';

// ---------------------------------------------------------------- Intro
export function Intro({ onStart, onScenarios }) {
  return (
    <div className="screen intro">
      <Eyebrow>German grammar · A2</Eyebrow>
      <h1 className="display">One mistake can have different causes.</h1>
      <p className="lead">Before you practise, a few short checks find out which cause applies to you. Then you practise exactly that — and try it in a new situation.</p>
      <ol className="intro-steps">
        <li><span>1</span><div><strong>Check</strong><p>4 quick tasks, about 2 minutes</p></div></li>
        <li><span>2</span><div><strong>Practise</strong><p>Short exercises chosen for you</p></div></li>
        <li><span>3</span><div><strong>Apply</strong><p>Write in a new situation</p></div></li>
      </ol>
      <div className="actions">
        <Button size="lg" onClick={onStart}>Start</Button>
        <Button variant="ghost" onClick={onScenarios}>Explore learner scenarios</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Error
const CAUSES = [
  'Gender of Bruder',
  'helfen takes Dativ',
  'Dativ verbs in general',
  'Akkusativ vs. Dativ forms',
  'mein- → meinem',
  'A slip while writing',
];
export function ErrorScreen({ onNext }) {
  return (
    <div className="screen">
      <Eyebrow>Your sentence</Eyebrow>
      <Card className="sentence-card">
        <div className="sentence wrong de">
          Ich helfe <mark className="m-wrong">{ORIGINAL_ERROR.wrongPart}</mark> Bruder.
        </div>
        <div className="sentence right de">
          Ich helfe <mark className="m-right">{ORIGINAL_ERROR.rightPart}</mark> Bruder.
        </div>
      </Card>
      <h2 className="h2">Same mistake, different reasons</h2>
      <p className="muted">It could be any of these. One sentence is not enough to tell.</p>
      <div className="cause-grid">
        {CAUSES.map((c) => (
          <div key={c} className="cause">{c}</div>
        ))}
      </div>
      <p className="note">You won't see right or wrong answers during the check — so one answer doesn't give away the next.</p>
      <div className="actions">
        <Button size="lg" onClick={onNext}>Start the check</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Diagnose
export function Diagnose({ task, index, total, isExtra, extraWhy, value, onChange, onBack, onNext, onReset }) {
  const complete = isTaskComplete(task, value);
  return (
    <div className="screen">
      <div className="task-head">
        <Eyebrow>{isExtra ? `Extra check · ${index + 1} of ${total}` : `Check ${index + 1} of ${total}`}</Eyebrow>
        <div className="dots" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={i < index ? 'done' : i === index ? 'cur' : ''} />
          ))}
        </div>
      </div>
      {isExtra && index === 0 && <p className="note">Your answers pointed in more than one direction. Two more items help us decide — instead of guessing.</p>}
      <Card>
        <h2 className="h2">{task.title}</h2>
        <p className="muted">{task.instruction}</p>
        {task.type === 'choice' && <ChoiceRows items={task.items} options={task.options} value={value} onChange={onChange} />}
        {task.type === 'sort' && <SortBoard columns={task.columns} items={task.items} value={value} onChange={onChange} />}
        {task.type === 'ending' && <EndingRows task={task} value={value} onChange={onChange} />}
      </Card>
      <div className="actions spread">
        <Button variant="ghost" onClick={onBack} disabled={index === 0 && isExtra}>Back</Button>
        <div className="actions">
          <Button variant="quiet" onClick={onReset}>Reset</Button>
          <Button onClick={onNext} disabled={!complete}>{index + 1 === total ? 'See result' : 'Next'}</Button>
        </div>
      </div>
      {isExtra && extraWhy && <span className="sr-only">{extraWhy}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- Result
export function Result({ state, route, answersReview, onPractice }) {
  const lines = evidenceSummary(state);
  const h = route.hypotheses;
  const main = route.rule === 'R8' ? null : route.rule === 'R6' ? null : HYPOTHESES[h[0]];
  return (
    <div className="screen">
      <Eyebrow>Your result</Eyebrow>
      <Card className="result-hero">
        <div className="result-top">
          <span className="muted small">Most likely cause</span>
          <ConfidenceBadge level={route.confidence.level} />
        </div>
        <h1 className="h1">{main ? main.label : route.copy.title}</h1>
        <p className="lead-sm">{main ? main.learner : route.copy.learner}</p>
        {route.rule === 'R6' && (
          <ul className="hyp-list">
            {h
              .filter((x) => !(x === 'H4' && h.includes('H3')))
              .map((x) => (
                <li key={x}>
                  {x === 'H3' && h.includes('H4')
                    ? 'The endings -en and -em may not yet be linked to the case — for articles and for mein-.'
                    : HYPOTHESES[x].learner}
                </li>
              ))}
          </ul>
        )}
        <Disclosure label="Why this confidence level?">
          <ul className="plain">{route.confidence.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </Disclosure>
      </Card>

      <div className="grid-2">
        <Card>
          <h3 className="h3">What led us here</h3>
          <ul className="evidence">
            {lines.map((l, i) => (
              <li key={i} className={`ev-${l.tone}`}>
                <span className="ev-dot" />
                <div><span className="ev-label">{l.label}</span><span className="ev-text de-mix">{l.text}</span></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="h3">Not ruled out yet</h3>
          <ul className="plain alt">
            {route.copy.alternatives.map((a) => <li key={a.text}>{a.text}</li>)}
          </ul>
        </Card>
      </div>

      <Card className="reco">
        <h3 className="h3">Recommended practice</h3>
        <div className="reco-blocks">
          {route.blocks.map((b, i) => (
            <div key={b} className="reco-block">
              <span className="reco-n">{i + 1}</span>
              <div>
                <strong>{PRACTICE_BLOCKS[b].title}</strong>
                <p className="muted small">{PRACTICE_BLOCKS[b].goal}</p>
                {route.light.includes(b) && <Badge tone="neutral">Light practice</Badge>}
              </div>
            </div>
          ))}
        </div>
        <Disclosure label="Why this practice?">
          <p>{route.reason}</p>
        </Disclosure>
        {route.deferred.length > 0 && (
          <p className="note">Later: {route.deferred.map((b) => PRACTICE_BLOCKS[b].title).join(', ')}. A full lesson on this topic would help more than short practice.</p>
        )}
        {route.lesson && !route.deferred.length && <p className="note">Several things connect here — a full lesson on the topic is recommended as well.</p>}
        <div className="actions">
          <Button size="lg" onClick={onPractice}>Start practice</Button>
        </div>
      </Card>

      <Disclosure label="Review your answers">{answersReview}</Disclosure>
    </div>
  );
}

export function AnswersReview({ state }) {
  const groups = [
    ['D1', state.G.evidence], ['D2', state.V.evidence], ['D3', state.A.evidence], ['D4', state.P.evidence],
    ...['G', 'V', 'A', 'P'].filter((k) => state[k].extra).map((k) => ['Extra', state[k].extra.evidence]),
  ];
  return (
    <div className="review">
      {groups.map(([t, ev], gi) => (
        <div key={gi} className="review-group">
          <span className="muted small">{t}</span>
          {ev.map((e) => (
            <div key={e.item} className={`review-row ${e.correct ? 'ok' : 'bad'}`}>
              <span className="de">{e.prompt}</span>
              <span className="de">{e.given}{!e.correct && <> → <strong>{e.expected}</strong></>}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Practice
export function Practice({ route, practice, current, onSelectBlock, onActivityDone, onNext, resetKeys, onResetActivity }) {
  const blockId = route.blocks[current.block];
  const block = PRACTICE_BLOCKS[blockId];
  const ps = practice[blockId] || { acts: {} };
  const actIdx = current.act;
  const activity = block.activities[actIdx];
  const actDone = !!ps.acts[activity.id];
  const blockDone = block.activities.every((a) => ps.acts[a.id]);
  const lastBlock = current.block === route.blocks.length - 1;
  return (
    <div className="screen">
      {route.blocks.length > 1 && (
        <div className="block-tabs" role="tablist">
          {route.blocks.map((b, i) => (
            <button key={b} type="button" role="tab" aria-selected={i === current.block} className={i === current.block ? 'on' : ''} onClick={() => onSelectBlock(i, 0)}>
              <span className="n">{i + 1}</span> {PRACTICE_BLOCKS[b].title}
              {practice[b]?.done && <span className="tick" aria-label="done">✓</span>}
            </button>
          ))}
        </div>
      )}
      <Eyebrow>Practice{route.light.includes(blockId) ? ' · light' : ''}</Eyebrow>
      <h1 className="h1">{block.title}</h1>
      <p className="lead-sm">{block.goal}</p>

      <div className="act-tabs">
        {block.activities.map((a, i) => (
          <button key={a.id} type="button" className={`${i === actIdx ? 'on' : ''} ${ps.acts[a.id] ? 'done' : ''}`} onClick={() => onSelectBlock(current.block, i)}>
            <span>{i + 1}</span> {a.label}
          </button>
        ))}
      </div>

      <Card>
        <Activity key={`${activity.id}-${resetKeys[activity.id] || 0}`} activity={activity} onComplete={(s) => onActivityDone(blockId, activity.id, s)} />
      </Card>

      <div className="actions spread">
        <Button variant="quiet" onClick={() => onResetActivity(blockId, activity.id)}>Reset exercise</Button>
        <div className="actions">
          {actIdx < block.activities.length - 1 && (
            <Button variant={actDone ? 'primary' : 'ghost'} onClick={() => onSelectBlock(current.block, actIdx + 1)}>
              {actDone ? 'Next exercise' : 'Skip'}
            </Button>
          )}
          {actIdx === block.activities.length - 1 && !lastBlock && (
            <Button variant={blockDone ? 'primary' : 'ghost'} onClick={() => onSelectBlock(current.block + 1, 0)}>Next practice</Button>
          )}
          {actIdx === block.activities.length - 1 && lastBlock && (
            <Button variant={blockDone ? 'primary' : 'ghost'} onClick={onNext}>Continue to Transfer Check</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Transfer
export function Transfer({ inputs, onInput, results, interpretation, onCheck, onReset, onProfile, scenario, onFillScenario, contrast }) {
  const checked = results && interpretation && interpretation.outcome !== 'incomplete';
  return (
    <div className="screen">
      <Eyebrow>Transfer check</Eyebrow>
      <h1 className="h1">New situation</h1>
      <p className="muted">{TRANSFER.context.task}</p>
      <Card className="chat">
        <div className="bubble them">
          <span className="who">{TRANSFER.context.from}</span>
          <span className="de">{TRANSFER.context.message}</span>
        </div>
        {TRANSFER.slots.map((slot) => {
          const r = results?.find((x) => x.slot === slot.id);
          return (
            <div key={slot.id} className={`slot ${r ? 'r-' + r.status : ''}`}>
              <div className="cue-chips">
                {slot.cue.map((c) => <span key={c} className="cue-chip de">{c}</span>)}
              </div>
              <input
                className="slot-input de"
                value={inputs[slot.id] || ''}
                onChange={(e) => onInput(slot.id, e.target.value)}
                placeholder="Write a sentence…"
                aria-label={`Sentence for: ${slot.cue.join(', ')}`}
                spellCheck={false}
              />
              {r && r.status === 'correct' && <p className="slot-fb good">"{r.phrase}" — correct.</p>}
              {r && r.status === 'wrong' && <p className="slot-fb bad">"{r.phrase}" — {ERROR_TEXT[r.errorType]}. Model: <span className="de">{slot.model}</span></p>}
              {r && r.status === 'notFound' && <p className="slot-fb try">Use the word "{slot.noun}" so we can check the form.</p>}
              {r && r.status === 'empty' && <p className="slot-fb try">Write a sentence for this cue.</p>}
            </div>
          );
        })}
        <p className="note small">Only the form before Opa, Onkel and Chef is checked. This is not an assessment of free writing.</p>
      </Card>
      <div className="actions spread">
        <div className="actions">
          <Button variant="quiet" onClick={onReset}>Reset</Button>
          {scenario && <Button variant="ghost" onClick={onFillScenario}>Use {scenario.name}'s answers</Button>}
        </div>
        <Button onClick={onCheck}>Check</Button>
      </div>
      {checked && (
        <Card className={`interp interp-${interpretation.outcome}`}>
          <h3 className="h3">{{ confirmed: 'Transfer shown', overgeneralized: 'Almost — watch the contrast', automatization: 'The slip came back', recheck: 'Not transferred yet' }[interpretation.outcome]}</h3>
          <p>{interpretation.text}</p>
          <p className="muted">{interpretation.next}</p>
          {contrast}
          <div className="actions">
            <Button onClick={onProfile}>See your skill profile</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Profile
const PROFILE_TONE = { assessment: 'none', practice: 'gap', improving: 'mixed', demonstrated: 'ok' };
export function Profile({ profile, onRestart, onScenarios }) {
  const [open, setOpen] = useState(null);
  const statuses = Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, 'p-' + v.status]));
  const labels = Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, PROFILE_STATUSES[v.status].label]));
  return (
    <div className="screen">
      <Eyebrow>Skill profile · this session</Eyebrow>
      <h1 className="h1">Your micro-skills</h1>
      <SkillMap statuses={statuses} labels={{}} showLegend={false} />
      <div className="status-legend">
        {Object.entries(PROFILE_STATUSES).map(([k, s]) => (
          <span key={k} className={`sl sl-${k}`}><i />{s.label}</span>
        ))}
      </div>
      <div className="profile-list">
        {SKILL_ORDER.map((k) => {
          const row = profile[k];
          const isOpen = open === k;
          return (
            <Card key={k} className={`profile-row pr-${row.status}`}>
              <button type="button" className="pr-head" onClick={() => setOpen(isOpen ? null : k)} aria-expanded={isOpen}>
                <div>
                  <span className="pr-id">{SKILLS[k].id}</span>
                  <strong>{SKILLS[k].learnerName}</strong>
                  <span className="muted small de"> {SKILLS[k].example}</span>
                </div>
                <span className={`pill pill-${row.status}`}>{labels[k]}</span>
              </button>
              {row.note && <p className="muted small pr-note">{row.note}</p>}
              {isOpen && (
                <ul className="pr-evidence">
                  {row.evidence.map((e, i) => (
                    <li key={i} className={`ev-${e.tone}`}>
                      <span className="ev-dot" />
                      <span className="pr-src">{e.source}</span>
                      <span className="de-mix">{e.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {!isOpen && <button type="button" className="link small" onClick={() => setOpen(k)}>Based on {row.evidence.length} observation{row.evidence.length === 1 ? '' : 's'}</button>}
            </Card>
          );
        })}
      </div>
      <p className="note">"Mastered" is never given after one session. A skill needs consistent evidence across several sessions, spaced in time.</p>
      <div className="actions">
        <Button onClick={onRestart}>Restart</Button>
        <Button variant="ghost" onClick={onScenarios}>Explore learner scenarios</Button>
      </div>
    </div>
  );
}

export { PROFILE_TONE };
