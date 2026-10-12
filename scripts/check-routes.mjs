// Runs every scenario + edge cases through scoring and routing. `npm run test:routes`
import { SCENARIOS } from '../src/content/scenarios.js';
import { scoreDiagnostics } from '../src/logic/scoring.js';
import { route } from '../src/logic/routing.js';
import { evaluateSlot, interpretTransfer } from '../src/logic/transfer.js';
import { TRANSFER } from '../src/content/transfer.js';
import { computeProfile } from '../src/logic/profile.js';

let fail = 0;
const check = (name, got, want) => {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${got}${ok ? '' : ` (want ${want})`}`);
};

function run(answers, extra = {}) {
  let r = route(scoreDiagnostics(answers, {}));
  const steps = [];
  if (r.stage === 'pending') {
    steps.push('pending:' + r.pending.map((p) => p.key + '/' + p.rule).join(','));
    r = route(scoreDiagnostics(answers, extra));
  }
  return { r, steps };
}

for (const s of SCENARIOS) {
  const { r, steps } = run(s.answers, s.extra);
  const label = steps.length ? `${steps.join(' ')} → ${r.rule}` : r.rule;
  console.log(`  ${s.id}: ${label} blocks=${r.blocks} deferred=${r.deferred} conf=${r.confidence.level}`);
  if (s.id === 'D') console.log('     reason:', r.reason);
  const want = { A: 'R1', B: 'R2', C: 'R3', D: 'R6', E: 'R5', F: 'R8', G: 'R3' }[s.id];
  check(`Scenario ${s.id}`, r.rule, want);
  const tr = TRANSFER.slots.map((slot) => evaluateSlot(slot, s.transfer[slot.id]));
  const t = interpretTransfer(tr, r.rule);
  console.log(`     transfer: ${t.outcome} | ${tr.map((x) => x.phrase + ':' + x.status).join(', ')}`);
  const prof = computeProfile({ state: scoreDiagnostics(s.answers, s.extra), transferResults: tr });
  console.log('     profile:', Object.entries(prof).map(([k, v]) => `${k}=${v.status}`).join(' '));
}

const base = {
  D1: { g1: 'der', g2: 'die', g3: 'das' },
  D2: { helfen: 'dat', besuchen: 'akk', danken: 'dat', fragen: 'akk', antworten: 'dat', sehen: 'akk' },
  D3: { a1: 'dem', a2: 'den', a3: 'dem' },
  D4: { p1: 'em', p2: 'en', p3: 'em' },
};
const mk = (p) => Object.fromEntries(Object.entries(base).map(([k, v]) => [k, { ...v, ...(p[k] || {}) }]));

// R4: forms only
check('R4 A+P gap', run(mk({ D3: { a1: 'den', a3: 'den' }, D4: { p1: 'en', p3: 'en' } })).r.rule, 'R4');
// R9 contradiction confirmed
const r9 = run(mk({ D3: { a1: 'den', a3: 'den' } }), { A: { xa1: 'den', xa2: 'dem' } });
check('R9 contradiction confirmed', r9.r.rule, 'R9');
// R9 resolved clean → R5
check('R9 resolved clean', run(mk({ D3: { a1: 'den', a3: 'den' } }), { A: { xa1: 'dem', xa2: 'den' } }).r.rule, 'R5');
// R7 confirmed
check('R7 confirmed', run(mk({ D1: { g1: 'die', g3: 'der' } }), { G: { xg1: 'die', xg2: 'der' } }).r.rule, 'R7');
// D2 bias: all in akk → partial → extra
const bias = run(mk({ D2: { besuchen:'dat', fragen:'dat'} }), { V: { gratulieren: 'dat', kennen: 'dat' } });
console.log('  bias steps:', bias.steps.join(' '), '→', bias.r.rule);
check('D2 bias → extra → R8 (mixed)', bias.r.rule, 'R8');
// R6 forms first (A errors 3/3 > V 2/3)
const r6f = run(mk({ D2: { helfen: 'akk', danken: 'akk' }, D3: { a1: 'den', a2: 'dem', a3: 'den' }, D4: { p1: 'en', p3: 'en' } }));
check('R6 forms first', r6f.r.blocks.join('>'), 'P4>P3');
console.log('     deferred:', r6f.r.deferred, '|', r6f.r.reason);
// R6 valency first (V 3/3 > P 2/3), A ok
const r6v = run(mk({ D2: { helfen: 'akk', danken: 'akk', antworten: 'akk' }, D4: { p1: 'en', p3: 'en' } }));
check('R6 valency first', r6v.r.blocks.join('>'), 'P2>P3');
// R1 + P partial → extra P clean → R1
check('R1 after P extra clean', run(mk({ D2: { helfen: 'akk' }, D4: { p3: 'en' } }), { P: { xp1: 'em', xp2: 'en' } }).r.rule, 'R1');
// D4 accepts whole word
check('D4 whole word', run(mk({ D4: { p1: 'meinem', p2: 'Meinen', p3: ' em ' } })).r.rule, 'R5');

console.log(fail ? `\n${fail} FAILED` : '\nAll route checks passed.');
process.exit(fail ? 1 : 0);
