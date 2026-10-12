import { useEffect, useState } from 'react';

export function Button({ variant = 'primary', size, className = '', ...props }) {
  return <button type="button" className={`btn btn-${variant} ${size ? 'btn-' + size : ''} ${className}`} {...props} />;
}

export function Badge({ tone = 'neutral', children, title }) {
  return (
    <span className={`badge badge-${tone}`} title={title}>
      {children}
    </span>
  );
}

export function CaseTag({ c }) {
  if (!c) return null;
  return <span className={`case-tag case-${c.toLowerCase().slice(0, 3)}`}>{c}</span>;
}

export function Card({ className = '', children, ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}

export function Disclosure({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`disclosure ${open ? 'open' : ''}`}>
      <button type="button" className="disclosure-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="chev" aria-hidden>
          ›
        </span>
        {label}
      </button>
      {open && <div className="disclosure-body">{children}</div>}
    </div>
  );
}

export const STEPS = [
  { id: 'intro', label: 'Start' },
  { id: 'error', label: 'Error' },
  { id: 'diagnose', label: 'Diagnose' },
  { id: 'result', label: 'Result' },
  { id: 'practice', label: 'Practice' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'profile', label: 'Profile' },
];

export function Stepper({ current, reachable, onGo }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <nav className="stepper" aria-label="Progress">
      <div className="stepper-bar">
        <div className="stepper-fill" style={{ width: `${(idx / (STEPS.length - 1)) * 100}%` }} />
      </div>
      <ol>
        {STEPS.map((s, i) => {
          const can = reachable.includes(s.id);
          return (
            <li key={s.id} className={i < idx ? 'done' : i === idx ? 'current' : ''}>
              <button type="button" disabled={!can} onClick={() => can && onGo(s.id)} aria-label={s.label} aria-current={i === idx ? 'step' : undefined}>
                <span className="dot" />
                <span className="lbl">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function ConfidenceBadge({ level }) {
  const tone = { high: 'good', medium: 'info', low: 'warn' }[level];
  return <Badge tone={tone}>{level[0].toUpperCase() + level.slice(1)} confidence</Badge>;
}

export function useNarrow(px = 640) {
  const q = `(max-width: ${px}px)`;
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return narrow;
}

export function Disclaimer() {
  return (
    <p className="disclaimer">
      Independent learning experience design concept. Not affiliated with Busuu. Diagnostic logic is simulated for demonstration purposes.
    </p>
  );
}
