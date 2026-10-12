import { RELATIONS, SKILLS } from '../content/skills.js';
import { useNarrow } from './ui.jsx';

const WIDE = { w: 720, h: 380, nw: 176, nh: 56, pos: { V2: [120, 60], G: [600, 60], V1: [120, 190], A: [600, 190], P: [600, 320], INT: [360, 320] } };
const NARROW = { w: 360, h: 500, nw: 150, nh: 56, pos: { V2: [90, 50], G: [270, 50], V1: [90, 175], A: [270, 175], P: [270, 300], INT: [180, 440] } };

function edgePoint([x, y], [tx, ty], nw, nh) {
  // point on the node border towards the target
  const dx = tx - x, dy = ty - y;
  const sx = Math.abs(dx) / (nw / 2), sy = Math.abs(dy) / (nh / 2);
  const s = Math.max(sx, sy) || 1;
  return [x + dx / s, y + dy / s];
}

/**
 * statuses: { [skillKey]: toneClass } — e.g. 'ok' | 'gap' | 'mixed' | 'none' | profile statuses
 * labels:   { [skillKey]: short status text }
 */
export function SkillMap({ statuses = {}, labels = {}, highlight = [], showLegend = true }) {
  const narrow = useNarrow();
  const L = narrow ? NARROW : WIDE;
  return (
    <figure className="skillmap">
      <svg viewBox={`0 0 ${L.w} ${L.h}`} role="img" aria-label="Micro-skill map with learning prerequisites and co-required skills">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="map-arrowhead" />
          </marker>
        </defs>
        {RELATIONS.map((r, i) => {
          const a = L.pos[r.from], b = L.pos[r.to];
          const [x1, y1] = edgePoint(a, b, L.nw + 8, L.nh + 8);
          const [x2, y2] = edgePoint(b, a, L.nw + 8, L.nh + 8);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={`map-edge edge-${r.type}`}
              markerEnd={r.type === 'prerequisite' ? 'url(#arrow)' : undefined}
            >
              <title>{r.note}</title>
            </line>
          );
        })}
        {Object.entries(L.pos).map(([k, [x, y]]) => {
          const s = SKILLS[k];
          const tone = statuses[k] || 'none';
          return (
            <g key={k} className={`map-node tone-${tone} ${highlight.includes(k) ? 'hl' : ''} ${s.pseudo ? 'pseudo' : ''}`} transform={`translate(${x - L.nw / 2}, ${y - L.nh / 2})`}>
              <rect width={L.nw} height={L.nh} rx="12" />
              <text x="14" y="22" className="map-id">
                {s.id}
                {labels[k] ? ` · ${labels[k]}` : ''}
              </text>
              <text x="14" y="41" className="map-name">
                {s.pseudo ? 'Target sentence (H5)' : s.learnerName}
              </text>
            </g>
          );
        })}
      </svg>
      {showLegend && (
        <figcaption className="map-legend">
          <span><i className="lg lg-pre" /> learning prerequisite</span>
          <span><i className="lg lg-co" /> co-required in the sentence</span>
          <span><i className="lg lg-inst" /> member of a group</span>
        </figcaption>
      )}
    </figure>
  );
}
