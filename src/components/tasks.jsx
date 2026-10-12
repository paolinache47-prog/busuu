// Diagnostic task renderers. They NEVER show correctness — diagnosis first.
import { useState } from 'react';
import { CaseTag } from './ui.jsx';

export function ChoiceRows({ items, options, value = {}, onChange, feedback, disabled }) {
  return (
    <div className="rows">
      {items.map((item) => {
        const opts = item.options || options;
        const fb = feedback?.[item.id];
        return (
          <div key={item.id} className={`row ${fb === true ? 'is-right' : fb === false ? 'is-wrong' : ''}`}>
            <div className="row-prompt">
              <CaseTag c={item.case || item.label} />
              <span className="de">{renderBlank(item.prompt, value[item.id])}</span>
            </div>
            <div className="seg" role="radiogroup" aria-label={item.prompt}>
              {opts.map((o) => (
                <button
                  type="button"
                  key={o}
                  role="radio"
                  aria-checked={value[item.id] === o}
                  className={value[item.id] === o ? 'on' : ''}
                  disabled={disabled || fb === true}
                  onClick={() => onChange({ ...value, [item.id]: o })}
                >
                  {o}
                </button>
              ))}
            </div>
            {fb === false && item.hint && <div className="row-hint">{item.hint}</div>}
          </div>
        );
      })}
    </div>
  );
}

function renderBlank(prompt, filled) {
  const parts = prompt.split('___');
  if (parts.length === 1) return prompt;
  return (
    <>
      {parts[0]}
      <span className={`blank ${filled ? 'filled' : ''}`}>{filled ? String(filled).replace(/^-/, '') : ' '}</span>
      {parts[1]}
    </>
  );
}

export function EndingRows({ task, value = {}, onChange }) {
  return (
    <div className="rows">
      {task.items.map((item) => (
        <div key={item.id} className="row">
          <div className="row-prompt">
            <CaseTag c={item.case} />
            <label className="de ending">
              <span>{task.stem}</span>
              <input
                className="ending-input"
                value={value[item.id] || ''}
                maxLength={8}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={`Ending for ${task.stem} ${item.noun}, ${item.case}`}
                onChange={(e) => onChange({ ...value, [item.id]: e.target.value })}
              />
              <span>{item.noun}</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

// Tap a chip, then tap a column. Tap a placed chip to send it back.
export function SortBoard({ columns, items, value = {}, onChange, feedback, explain }) {
  const [picked, setPicked] = useState(null);
  const pool = items.filter((i) => !value[i.id]);
  const place = (col) => {
    if (!picked) return;
    onChange({ ...value, [picked]: col });
    setPicked(null);
  };
  const unplace = (id) => {
    if (feedback?.[id] === true) return;
    const next = { ...value };
    delete next[id];
    onChange(next);
    setPicked(id);
  };
  return (
    <div className="sort">
      <div className={`sort-pool ${pool.length ? '' : 'empty'}`}>
        {pool.length ? (
          pool.map((i) => (
            <button type="button" key={i.id} className={`chip de ${picked === i.id ? 'picked' : ''}`} onClick={() => setPicked(picked === i.id ? null : i.id)}>
              {i.text}
            </button>
          ))
        ) : (
          <span className="muted small">All placed. Tap a word to move it.</span>
        )}
      </div>
      <p className="sort-help muted small">{picked ? 'Now tap a column.' : pool.length ? 'Tap a word, then a column.' : ''}</p>
      <div className="sort-cols" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((c) => (
          <div key={c.id} className={`sort-col ${picked ? 'armed' : ''}`} onClick={() => place(c.id)}>
            <button type="button" className="sort-col-head" disabled={!picked} onClick={(e) => { e.stopPropagation(); place(c.id); }} aria-label={`Place in ${c.label} ${c.sub || ''}`}>
              <span className="de strong">{c.label}</span>
              {c.sub && <span className="muted small">{c.sub}</span>}
            </button>
            <div className="sort-col-body">
              {items
                .filter((i) => value[i.id] === c.id)
                .map((i) => {
                  const fb = feedback?.[i.id];
                  return (
                    <button
                      type="button"
                      key={i.id}
                      className={`chip de placed ${fb === true ? 'right' : fb === false ? 'wrong' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        unplace(i.id);
                      }}
                    >
                      {i.text}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      {explain && <p className="explain">{explain}</p>}
    </div>
  );
}

export function isTaskComplete(task, value = {}) {
  return task.items.every((i) => String(value[i.id] ?? '').trim() !== '');
}
