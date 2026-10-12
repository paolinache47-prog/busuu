import { useEffect, useMemo, useState } from 'react';
import { Button, Disclaimer, Stepper } from './components/ui.jsx';
import { Intro, ErrorScreen, Diagnose, Result, AnswersReview, Practice, Transfer, Profile } from './components/LearnerScreens.jsx';
import { DesignerView } from './components/DesignerView.jsx';
import { ScenarioPanel } from './components/ScenarioPanel.jsx';
import { Activity } from './components/activities.jsx';
import { EXTRA_CHECKS } from './content/diagnostics.js';
import { PRACTICE_BLOCKS } from './content/practice.js';
import { TRANSFER } from './content/transfer.js';
import { SCENARIOS } from './content/scenarios.js';
import { planDiagnostic } from './logic/plan.js';
import { scoreDiagnostics } from './logic/scoring.js';
import { route as computeRoute } from './logic/routing.js';
import { evaluateSlot, interpretTransfer } from './logic/transfer.js';
import { computeProfile } from './logic/profile.js';

const MAIN_TASKS = planDiagnostic().filter((p) => p.include).map((p) => p.task);
const EMPTY_ANSWERS = () => Object.fromEntries(MAIN_TASKS.map((t) => [t.id, {}]));

export default function App() {
  const [view, setView] = useState('learner');
  const [screen, setScreen] = useState('intro');
  const [panelOpen, setPanelOpen] = useState(false);
  const [scenarioId, setScenarioId] = useState(null);

  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [extra, setExtra] = useState({});
  const [diag, setDiag] = useState({ phase: 'main', index: 0, extraKeys: [], done: false });

  const [practice, setPractice] = useState({});
  const [cur, setCur] = useState({ block: 0, act: 0 });
  const [resetKeys, setResetKeys] = useState({});

  const [tInputs, setTInputs] = useState({});
  const [tResults, setTResults] = useState(null);
  const [contrastKey, setContrastKey] = useState(0);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || null;

  // ---- derived diagnosis
  const scored = useMemo(() => (diag.done || diag.phase === 'extra' ? scoreDiagnostics(answers, extra) : null), [answers, extra, diag]);
  const routeResult = useMemo(() => (scored ? computeRoute(scored) : null), [scored]);
  const final = routeResult?.stage === 'final' && diag.done;
  const tInterp = useMemo(() => (tResults && final ? interpretTransfer(tResults, routeResult.rule) : null), [tResults, final, routeResult]);
  const profile = useMemo(() => {
    if (!final) return null;
    const p = Object.fromEntries(Object.entries(practice).map(([b, v]) => [b, { done: v.done, firstTry: v.firstTry, total: v.total }]));
    return computeProfile({ state: scored, practice: p, transferResults: tResults || [] });
  }, [final, scored, practice, tResults]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen, view, diag.index, diag.phase]);

  // ---- session control
  function resetSession() {
    setAnswers(EMPTY_ANSWERS());
    setExtra({});
    setDiag({ phase: 'main', index: 0, extraKeys: [], done: false });
    setPractice({});
    setCur({ block: 0, act: 0 });
    setResetKeys({});
    setTInputs({});
    setTResults(null);
  }
  function restart() {
    resetSession();
    setScenarioId(null);
    setScreen('intro');
    setView('learner');
  }
  function loadScenario(id) {
    const s = SCENARIOS.find((x) => x.id === id);
    resetSession();
    setScenarioId(id);
    setAnswers(structuredClone(s.answers));
    const r = computeRoute(scoreDiagnostics(s.answers, s.extra));
    const pendingWithoutExtra = computeRoute(scoreDiagnostics(s.answers, {}));
    const keys = pendingWithoutExtra.stage === 'pending' ? [...new Set(pendingWithoutExtra.pending.map((p) => p.key))] : [];
    if (r.stage === 'pending') {
      // scenario lacks extra answers → let the user answer the extra check
      setDiag({ phase: 'extra', index: 0, extraKeys: [...new Set(r.pending.map((p) => p.key))], done: false });
      setScreen('diagnose');
    } else {
      setExtra(structuredClone(s.extra));
      setDiag({ phase: 'extra', index: Math.max(0, keys.length - 1), extraKeys: keys, done: true });
      setScreen('result');
    }
    setPanelOpen(false);
  }

  // ---- diagnose navigation
  const tasks = diag.phase === 'main' ? MAIN_TASKS : diag.extraKeys.map((k) => EXTRA_CHECKS[k]);
  const task = tasks[diag.index];
  const taskValue = diag.phase === 'main' ? answers[task?.id] : extra[diag.extraKeys[diag.index]];
  function setTaskValue(v) {
    if (diag.phase === 'main') setAnswers((a) => ({ ...a, [task.id]: v }));
    else setExtra((e) => ({ ...e, [diag.extraKeys[diag.index]]: v }));
  }
  function nextTask() {
    if (diag.index + 1 < tasks.length) return setDiag({ ...diag, index: diag.index + 1 });
    const r = computeRoute(scoreDiagnostics(answers, diag.phase === 'main' ? {} : extra));
    if (r.stage === 'pending') {
      const keys = [...new Set(r.pending.map((p) => p.key))];
      if (diag.phase === 'main') {
        setExtra({});
        return setDiag({ phase: 'extra', index: 0, extraKeys: keys, done: false });
      }
      // a resolved extra check can reveal a new contradiction (e.g. P clears → R9 on A)
      const fresh = keys.filter((k) => !diag.extraKeys.includes(k));
      if (fresh.length) return setDiag({ ...diag, extraKeys: [...diag.extraKeys, ...fresh], index: diag.extraKeys.length });
    }
    setDiag({ ...diag, done: true });
    setScreen('result');
  }
  function prevTask() {
    if (diag.index > 0) setDiag({ ...diag, index: diag.index - 1 });
    else setScreen('error');
  }

  // ---- practice
  function onActivityDone(blockId, actId, stats) {
    setPractice((p) => {
      const b = p[blockId] || { acts: {} };
      const acts = { ...b.acts, [actId]: stats };
      const all = PRACTICE_BLOCKS[blockId].activities;
      const done = all.every((a) => acts[a.id]);
      const firstTry = Object.values(acts).reduce((s, a) => s + a.firstTry, 0);
      const total = Object.values(acts).reduce((s, a) => s + a.total, 0);
      return { ...p, [blockId]: { acts, done, firstTry, total } };
    });
  }
  function resetActivity(blockId, actId) {
    setResetKeys((k) => ({ ...k, [actId]: (k[actId] || 0) + 1 }));
    setPractice((p) => {
      const b = p[blockId];
      if (!b) return p;
      const acts = { ...b.acts };
      delete acts[actId];
      return { ...p, [blockId]: { ...b, acts, done: false } };
    });
  }

  // ---- transfer
  function checkTransfer() {
    setTResults(TRANSFER.slots.map((s) => evaluateSlot(s, tInputs[s.id])));
    setContrastKey((k) => k + 1);
  }
  const contrastActivity = tInterp?.contrastActivity
    ? Object.values(PRACTICE_BLOCKS).flatMap((b) => b.activities).find((a) => a.id === tInterp.contrastActivity)
    : null;

  const reachable = ['intro', 'error', ...(final ? ['result', 'practice', 'transfer', 'profile'] : ['diagnose'])];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".14" /><path d="M7 12.5l3 3 7-7" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <strong>Grammar Diagnostic</strong>
            <span className="brand-sub">Diagnose before you remediate</span>
          </div>
        </div>
        <div className="top-actions">
          <div className="seg seg-view" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'learner'} className={view === 'learner' ? 'on' : ''} onClick={() => setView('learner')}>Learner</button>
            <button type="button" role="tab" aria-selected={view === 'designer'} className={view === 'designer' ? 'on' : ''} onClick={() => setView('designer')}>Designer</button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPanelOpen(true)}>Scenarios</Button>
          <Button variant="quiet" size="sm" onClick={restart}>Restart</Button>
        </div>
      </header>

      {scenario && (
        <div className="scenario-bar">
          Viewing <strong>{scenario.name}</strong> — {scenario.tagline}
          <button type="button" className="link" onClick={restart}>Exit scenario</button>
        </div>
      )}

      <main className={view === 'designer' ? 'main wide' : 'main'}>
        {view === 'learner' && screen !== 'intro' && <Stepper current={screen} reachable={reachable} onGo={setScreen} />}

        {view === 'designer' && <DesignerView state={scored} route={routeResult} scenario={scenario} transferInterp={tInterp} />}

        {view === 'learner' && (
          <>
            {screen === 'intro' && <Intro onStart={() => setScreen('error')} onScenarios={() => setPanelOpen(true)} />}
            {screen === 'error' && <ErrorScreen onNext={() => setScreen(diag.done ? 'result' : 'diagnose')} />}
            {screen === 'diagnose' && task && (
              <Diagnose
                key={`${diag.phase}-${diag.index}`}
                task={task}
                index={diag.index}
                total={tasks.length}
                isExtra={diag.phase === 'extra'}
                value={taskValue}
                onChange={setTaskValue}
                onBack={prevTask}
                onNext={nextTask}
                onReset={() => setTaskValue({})}
              />
            )}
            {screen === 'result' && final && (
              <Result state={scored} route={routeResult} answersReview={<AnswersReview state={scored} />} onPractice={() => { setCur({ block: 0, act: 0 }); setScreen('practice'); }} />
            )}
            {screen === 'practice' && final && (
              <Practice
                route={routeResult}
                practice={practice}
                current={cur}
                onSelectBlock={(block, act) => setCur({ block, act })}
                onActivityDone={onActivityDone}
                onNext={() => setScreen('transfer')}
                resetKeys={resetKeys}
                onResetActivity={resetActivity}
              />
            )}
            {screen === 'transfer' && final && (
              <Transfer
                inputs={tInputs}
                onInput={(id, v) => setTInputs((t) => ({ ...t, [id]: v }))}
                results={tResults}
                interpretation={tInterp}
                onCheck={checkTransfer}
                onReset={() => { setTInputs({}); setTResults(null); }}
                onProfile={() => setScreen('profile')}
                scenario={scenario}
                onFillScenario={() => setTInputs({ ...scenario.transfer })}
                contrast={
                  contrastActivity && (
                    <div className="contrast">
                      <h4 className="h4">Contrast practice</h4>
                      <Activity key={contrastKey} activity={contrastActivity} />
                      <p className="small muted">Then edit your sentences above and check again.</p>
                    </div>
                  )
                }
              />
            )}
            {screen === 'profile' && profile && <Profile profile={profile} onRestart={restart} onScenarios={() => setPanelOpen(true)} />}
          </>
        )}
      </main>

      <footer className="footer">
        <Disclaimer />
      </footer>

      <ScenarioPanel open={panelOpen} activeId={scenarioId} onClose={() => setPanelOpen(false)} onLoad={loadScenario} onSelf={() => { setPanelOpen(false); restart(); setScreen('error'); }} />
    </div>
  );
}
