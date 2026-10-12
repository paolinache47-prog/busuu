import { useEffect } from 'react';
import { SCENARIOS } from '../content/scenarios.js';
import { Button } from './ui.jsx';

export function ScenarioPanel({ open, onClose, onLoad, onSelf, activeId }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <aside className="panel" role="dialog" aria-modal="true" aria-label="Explore learner scenarios" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <div>
            <h2 className="h2">Explore learner scenarios</h2>
            <p className="muted small">Pre-recorded answers, run through the same rules as live answers.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="sc-list">
          {SCENARIOS.map((s) => (
            <button key={s.id} type="button" className={`sc ${activeId === s.id ? 'on' : ''}`} onClick={() => onLoad(s.id)}>
              <span className="sc-av">{s.id}</span>
              <span className="sc-body">
                <strong>{s.name}</strong>
                <span className="small muted">{s.tagline}</span>
              </span>
              <span className="sc-route mono">{s.expected}</span>
            </button>
          ))}
        </div>
        <div className="panel-foot">
          <Button variant="ghost" onClick={onSelf}>Take the check yourself</Button>
        </div>
      </aside>
    </div>
  );
}
