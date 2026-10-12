// Practice activities: real interaction, corrective feedback, retry.
// Each reports { firstTry, total } once, when everything is correct.
import { useEffect, useRef, useState } from 'react';
import { Button, CaseTag } from './ui.jsx';
import { ChoiceRows, SortBoard } from './tasks.jsx';

const clean = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[.!?,]/g, '')
    .replace(/\s+/g, ' ');

function useAttempts(onComplete) {
  const [first, setFirst] = useState(null);
  const [done, setDone] = useState(false);
  const record = (correctCount, total) => {
    const f = first ?? correctCount;
    if (first === null) setFirst(correctCount);
    if (correctCount === total && !done) {
      setDone(true);
      onComplete?.({ firstTry: f, total });
    }
    return f;
  };
  return { first, done, record };
}

function Footer({ onCheck, canCheck, done, status, explain }) {
  return (
    <div className="act-footer">
      {status && <p className={`act-status ${done ? 'good' : 'try'}`}>{status}</p>}
      {done && explain && <p className="explain">{explain}</p>}
      {!done && (
        <Button onClick={onCheck} disabled={!canCheck}>
          Check
        </Button>
      )}
    </div>
  );
}

function statusLine(right, total, done) {
  if (done) return 'All correct.';
  return `${right} of ${total} correct — fix the marked ones and check again.`;
}

// ---------- choice
function ChoiceAct({ activity, onComplete }) {
  const [value, setValue] = useState({});
  const [fb, setFb] = useState(null);
  const { done, record } = useAttempts(onComplete);
  const check = () => {
    const f = Object.fromEntries(activity.items.map((i) => [i.id, value[i.id] === i.answer]));
    setFb(f);
    record(Object.values(f).filter(Boolean).length, activity.items.length);
  };
  const right = fb ? Object.values(fb).filter(Boolean).length : 0;
  return (
    <>
      <ChoiceRows
        items={activity.items}
        value={value}
        feedback={fb}
        onChange={(v) => {
          setValue(v);
          if (fb) setFb(Object.fromEntries(Object.entries(fb).map(([k, ok]) => [k, ok === true ? true : v[k] === value[k] ? false : undefined])));
        }}
      />
      <Footer onCheck={check} canCheck={activity.items.every((i) => value[i.id])} done={done} status={fb && statusLine(right, activity.items.length, done)} explain={activity.explain} />
    </>
  );
}

// ---------- sort
function SortAct({ activity, onComplete }) {
  const [value, setValue] = useState({});
  const [fb, setFb] = useState(null);
  const { done, record } = useAttempts(onComplete);
  const check = () => {
    const f = Object.fromEntries(activity.items.map((i) => [i.id, value[i.id] === i.answer]));
    setFb(f);
    record(Object.values(f).filter(Boolean).length, activity.items.length);
  };
  const right = fb ? Object.values(fb).filter(Boolean).length : 0;
  return (
    <>
      <SortBoard
        columns={activity.columns}
        items={activity.items}
        value={value}
        feedback={fb}
        onChange={(v) => {
          setValue(v);
          if (fb) setFb(Object.fromEntries(Object.entries(fb).map(([k, ok]) => [k, ok === true ? true : v[k] === value[k] ? false : undefined])));
        }}
      />
      <Footer onCheck={check} canCheck={activity.items.every((i) => value[i.id])} done={done} status={fb && statusLine(right, activity.items.length, done)} explain={activity.explain} />
    </>
  );
}

// ---------- notice: tap tokens
function NoticeAct({ activity, onComplete }) {
  const [sel, setSel] = useState({}); // "s-i" → true
  const [fb, setFb] = useState(null);
  const { done, record } = useAttempts(onComplete);
  const toggle = (s, i) => {
    if (done) return;
    const k = `${s}-${i}`;
    setSel((p) => ({ ...p, [k]: !p[k] }));
  };
  const check = () => {
    const f = activity.sentences.map((sen, s) => {
      const chosen = sen.tokens.map((_, i) => !!sel[`${s}-${i}`]);
      return chosen.every((c, i) => c === sen.targets.includes(i));
    });
    setFb(f);
    record(f.filter(Boolean).length, f.length);
  };
  const right = fb ? fb.filter(Boolean).length : 0;
  return (
    <>
      <div className="notice">
        {activity.sentences.map((sen, s) => (
          <div key={s} className={`notice-line ${fb ? (fb[s] ? 'is-right' : 'is-wrong') : ''}`}>
            {sen.tokens.map((t, i) => {
              const on = !!sel[`${s}-${i}`];
              const showTarget = done && sen.targets.includes(i);
              return (
                <button type="button" key={i} className={`token de ${on ? 'on' : ''} ${showTarget ? 'target' : ''}`} onClick={() => toggle(s, i)} aria-pressed={on}>
                  {t}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Footer onCheck={check} canCheck={true} done={done} status={fb && (done ? 'All correct.' : `${right} of ${fb.length} sentences right — adjust and check again.`)} explain={activity.explain} />
    </>
  );
}

// ---------- build from tiles
function BuildAct({ activity, onComplete }) {
  const [line, setLine] = useState([]); // tile indices
  const [fb, setFb] = useState(null);
  const { done, record } = useAttempts(onComplete);
  const used = new Set(line);
  const check = () => {
    const words = line.map((i) => activity.tiles[i]);
    const ok = words.join(' ') === activity.answer.join(' ');
    let hint = null;
    if (!ok) {
      const h = activity.hints.find((x) => x.when && words.includes(x.when)) || activity.hints.find((x) => x.default);
      hint = h?.text;
    }
    setFb({ ok, hint });
    record(ok ? 1 : 0, 1);
  };
  return (
    <>
      <p className="cue de">{activity.cue}</p>
      <div className={`build-line ${fb ? (fb.ok ? 'is-right' : 'is-wrong') : ''}`}>
        {line.length ? (
          line.map((ti, pos) => (
            <button type="button" key={pos} className="chip de placed" disabled={done} onClick={() => { setLine(line.filter((_, p) => p !== pos)); setFb(null); }}>
              {activity.tiles[ti]}
            </button>
          ))
        ) : (
          <span className="muted small">Tap the words in order.</span>
        )}
        {line.length > 0 && !done && (
          <button type="button" className="link small build-clear" onClick={() => { setLine([]); setFb(null); }}>
            Clear
          </button>
        )}
      </div>
      <div className="sort-pool">
        {activity.tiles.map((t, i) => (
          <button type="button" key={i} className="chip de" disabled={used.has(i) || done} onClick={() => { setLine([...line, i]); setFb(null); }}>
            {t}
          </button>
        ))}
      </div>
      <Footer onCheck={check} canCheck={line.length >= activity.answer.length} done={done} status={fb && (fb.ok ? 'All correct.' : fb.hint)} explain={done ? activity.answer.join(' ') + '.' : null} />
    </>
  );
}

// ---------- typed gaps
function TypeAct({ activity, onComplete }) {
  const [value, setValue] = useState({});
  const [fb, setFb] = useState(null);
  const { done, record } = useAttempts(onComplete);
  const check = () => {
    const f = Object.fromEntries(activity.items.map((i) => [i.id, i.accept.map(clean).includes(clean(value[i.id]))]));
    setFb(f);
    record(Object.values(f).filter(Boolean).length, activity.items.length);
  };
  const right = fb ? Object.values(fb).filter(Boolean).length : 0;
  return (
    <>
      <div className="rows">
        {activity.items.map((i) => {
          const f = fb?.[i.id];
          return (
            <div key={i.id} className={`row ${f === true ? 'is-right' : f === false ? 'is-wrong' : ''}`}>
              <div className="row-prompt de type-line">
                <span>{i.before}</span>
                <input
                  className="gap-input"
                  value={value[i.id] || ''}
                  disabled={f === true}
                  placeholder={i.cue}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label={`${i.before} ___ ${i.after}`}
                  onChange={(e) => {
                    setValue({ ...value, [i.id]: e.target.value });
                    if (fb && f === false) setFb({ ...fb, [i.id]: undefined });
                  }}
                />
                <span>{i.after}</span>
              </div>
              {f === false && <div className="row-hint">{i.hint || 'Not quite — try again.'}</div>}
            </div>
          );
        })}
      </div>
      <Footer onCheck={check} canCheck={activity.items.every((i) => String(value[i.id] || '').trim())} done={done} status={fb && statusLine(right, activity.items.length, done)} explain={activity.explain} />
    </>
  );
}

// ---------- listening (browser speech synthesis, de-DE)
const ttsAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
function speak(text) {
  if (!ttsAvailable()) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  u.rate = 0.85;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang?.startsWith('de'));
  if (v) u.voice = v;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return true;
}

function ListenAct({ activity, onComplete }) {
  const [value, setValue] = useState({});
  const [fb, setFb] = useState(null);
  const [noAudio, setNoAudio] = useState(!ttsAvailable());
  const { done, record } = useAttempts(onComplete);
  const check = () => {
    const f = Object.fromEntries(activity.items.map((i) => [i.id, value[i.id] === i.answer]));
    setFb(f);
    record(Object.values(f).filter(Boolean).length, activity.items.length);
  };
  const right = fb ? Object.values(fb).filter(Boolean).length : 0;
  const masked = (s) => s.replace(/mein(em|en)/, 'mein__');
  return (
    <>
      {noAudio && <p className="note">Audio is not available in this browser. The sentence is shown with the ending hidden — answer from context.</p>}
      <div className="rows">
        {activity.items.map((i, n) => {
          const f = fb?.[i.id];
          return (
            <div key={i.id} className={`row ${f === true ? 'is-right' : f === false ? 'is-wrong' : ''}`}>
              <div className="row-prompt">
                <Button variant="ghost" size="sm" onClick={() => { if (!speak(i.sentence)) setNoAudio(true); }} aria-label={`Play sentence ${n + 1}`}>
                  ▶ Play {n + 1}
                </Button>
                {(noAudio || done) && <span className="de muted">{done ? i.sentence : masked(i.sentence)}</span>}
              </div>
              <div className="seg">
                {activity.options.map((o) => (
                  <button type="button" key={o} className={value[i.id] === o ? 'on' : ''} disabled={f === true} onClick={() => { setValue({ ...value, [i.id]: o }); if (f === false) setFb({ ...fb, [i.id]: undefined }); }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Footer onCheck={check} canCheck={activity.items.every((i) => value[i.id])} done={done} status={fb && statusLine(right, activity.items.length, done)} />
    </>
  );
}

// ---------- timed retrieval
function SpeedAct({ activity, onComplete }) {
  const [queue, setQueue] = useState(activity.items.map((i) => i.id));
  const [pos, setPos] = useState(-1); // -1 = not started
  const [left, setLeft] = useState(activity.seconds);
  const [round, setRound] = useState(1);
  const [results, setResults] = useState({}); // id → true/false (current round)
  const [firstPass, setFirstPass] = useState(null);
  const [last, setLast] = useState(null);
  const [done, setDone] = useState(false);
  const timer = useRef(null);
  const item = pos >= 0 && pos < queue.length ? activity.items.find((i) => i.id === queue[pos]) : null;

  useEffect(() => {
    if (!item) return;
    setLeft(activity.seconds);
    timer.current = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(timer.current);
  }, [item?.id, round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (item && left <= 0) answer(null);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  function answer(opt) {
    clearInterval(timer.current);
    const ok = opt === item.answer;
    const next = { ...results, [item.id]: ok };
    setResults(next);
    setLast({ ok, timeout: opt === null, answer: item.answer });
    if (pos + 1 >= queue.length) finishRound(next);
    else setPos(pos + 1);
  }

  function finishRound(res) {
    const right = Object.values(res).filter(Boolean).length;
    if (firstPass === null) setFirstPass(right);
    const missed = queue.filter((id) => !res[id]);
    setPos(queue.length); // round over
    if (!missed.length && !done) {
      setDone(true);
      onComplete?.({ firstTry: firstPass ?? right, total: activity.items.length });
    }
  }

  const missed = queue.filter((id) => results[id] === false);
  const roundOver = pos >= queue.length;

  return (
    <div className="speed">
      {pos === -1 && (
        <div className="speed-start">
          <p className="muted">{activity.items.length} questions · {activity.seconds} seconds each</p>
          <Button onClick={() => setPos(0)}>Start</Button>
        </div>
      )}
      {item && (
        <div className="speed-card" key={item.id + round}>
          <div className="speed-top">
            <span className="muted small">
              {pos + 1} / {queue.length}
            </span>
            <span className={`timer ${left <= 2 ? 'low' : ''}`}>{left}s</span>
          </div>
          <div className="speed-bar"><div style={{ width: `${(left / activity.seconds) * 100}%` }} /></div>
          <p className="speed-q de">{item.question}</p>
          <div className="speed-opts">
            {item.options.map((o) => (
              <button type="button" key={o} className="opt de" onClick={() => answer(o)}>
                {o}
              </button>
            ))}
          </div>
          {last && <p className={`act-status ${last.ok ? 'good' : 'try'}`}>{last.ok ? 'Previous: correct.' : `Previous: ${last.timeout ? 'time ran out' : 'not quite'} — ${last.answer}`}</p>}
        </div>
      )}
      {roundOver && (
        <div className="speed-end">
          {done ? (
            <p className="act-status good">All correct{round > 1 ? ' after another round' : ''}.</p>
          ) : (
            <>
              <p className="act-status try">{missed.length} missed:</p>
              <ul className="plain small">
                {missed.map((id) => {
                  const it = activity.items.find((x) => x.id === id);
                  return (
                    <li key={id}>
                      <span className="de">{it.question}</span> → <span className="de strong">{it.answer}</span>
                    </li>
                  );
                })}
              </ul>
              <Button
                onClick={() => {
                  setQueue(missed);
                  setResults({});
                  setRound(round + 1);
                  setLast(null);
                  setPos(0);
                }}
              >
                Try the missed ones again
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- self-correction
function EditAct({ activity, onComplete }) {
  const [text, setText] = useState(activity.original);
  const [fb, setFb] = useState(null);
  const { done, record } = useAttempts(onComplete);
  const check = () => {
    const ok = activity.accept.map(clean).includes(clean(text));
    setFb(ok);
    record(ok ? 1 : 0, 1);
  };
  return (
    <>
      <div className="edit-orig">
        <span className="muted small">Your sentence</span>
        <span className="de strike">{activity.original}</span>
      </div>
      <input className={`edit-input de ${fb === true ? 'is-right' : fb === false ? 'is-wrong' : ''}`} value={text} disabled={done} onChange={(e) => { setText(e.target.value); setFb(null); }} aria-label="Corrected sentence" spellCheck={false} />
      <Footer onCheck={check} canCheck={text.trim().length > 0} done={done} status={fb === null ? null : fb ? 'All correct.' : activity.hint} />
    </>
  );
}

const REGISTRY = { choice: ChoiceAct, sort: SortAct, notice: NoticeAct, build: BuildAct, type: TypeAct, listen: ListenAct, speed: SpeedAct, edit: EditAct };

export function Activity({ activity, onComplete }) {
  const C = REGISTRY[activity.type];
  return (
    <div className="activity">
      <p className="act-instruction">{activity.instruction}</p>
      <C activity={activity} onComplete={onComplete} />
    </div>
  );
}

export { CaseTag };
