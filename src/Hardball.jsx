import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, X, ChevronRight } from 'lucide-react';

// ─── API base ────────────────────────────────────────────────────────────────
// Set VITE_API_BASE in .env. Falls back to localhost:5000 for local dev.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0A0A0F',
  surface: '#101017',
  surfaceHi: '#16161F',
  border: '#1F1F2C',
  borderHi: '#2A2A3A',
  text: '#E4E4E7',
  muted: '#71717A',
  dim: '#52525B',
  green: '#00FF87',
  greenDim: '#00C96B',
  blue: '#0EA5E9',
  red: '#F43F5E',
  amber: '#FBBF24',
};

function statusColor(status) {
    if (status === '2ND APRON') return COLORS.red;
    if (status === 'OVER APRON 1' || status === 'HARD CAPPED') return COLORS.red;
    if (status === 'OVER TAX' || status === 'NEAR TAX') return COLORS.amber;
    if (status === 'OVER CAP') return COLORS.blue;
    if (status === 'CAP ROOM' || status === 'FLEXIBLE') return COLORS.green;
    return COLORS.muted;
}

const CAP_LINES = {
    cap: 154.647,
    tax: 187.895,
    apron1: 195.945,
    apron2: 207.824,
};


const TEAM_ALIASES = {
    ATL:'ATL', Hawks:'ATL', hawks:'ATL',
    BOS:'BOS', Celtics:'BOS', celtics:'BOS',
    BKN:'BKN', Nets:'BKN', nets:'BKN',
    CHA:'CHA', Hornets:'CHA', hornets:'CHA',
    CHI:'CHI', Bulls:'CHI', bulls:'CHI',
    CLE:'CLE', Cavaliers:'CLE', cavaliers:'CLE', Cavs:'CLE', cavs:'CLE',
    DAL:'DAL', Mavericks:'DAL', mavericks:'DAL', Mavs:'DAL', mavs:'DAL',
    DEN:'DEN', Nuggets:'DEN', nuggets:'DEN',
    DET:'DET', Pistons:'DET', pistons:'DET',
    GSW:'GSW', Warriors:'GSW', warriors:'GSW',
    HOU:'HOU', Rockets:'HOU', rockets:'HOU',
    IND:'IND', Pacers:'IND', pacers:'IND',
    LAC:'LAC', Clippers:'LAC', clippers:'LAC',
    LAL:'LAL', Lakers:'LAL', lakers:'LAL',
    MEM:'MEM', Grizzlies:'MEM', grizzlies:'MEM',
    MIA:'MIA', Heat:'MIA', heat:'MIA',
    MIL:'MIL', Bucks:'MIL', bucks:'MIL',
    MIN:'MIN', Timberwolves:'MIN', timberwolves:'MIN', Wolves:'MIN', wolves:'MIN',
    NOP:'NOP', Pelicans:'NOP', pelicans:'NOP',
    NYK:'NYK', Knicks:'NYK', knicks:'NYK',
    OKC:'OKC', Thunder:'OKC', thunder:'OKC',
    ORL:'ORL', Magic:'ORL', magic:'ORL',
    PHI:'PHI', '76ers':'PHI', sixers:'PHI', Sixers:'PHI',
    PHX:'PHX', Suns:'PHX', suns:'PHX',
    POR:'POR', 'Trail Blazers':'POR', Blazers:'POR', blazers:'POR',
    SAC:'SAC', Kings:'SAC', kings:'SAC',
    SAS:'SAS', Spurs:'SAS', spurs:'SAS',
    TOR:'TOR', Raptors:'TOR', raptors:'TOR',
    UTA:'UTA', Jazz:'UTA', jazz:'UTA',
    WAS:'WAS', Wizards:'WAS', wizards:'WAS',
};

const TEAM_PATTERN = /\b(Hawks|Celtics|Nets|Hornets|Bulls|Cavaliers|Cavs|Mavericks|Mavs|Nuggets|Pistons|Warriors|Rockets|Pacers|Clippers|Lakers|Grizzlies|Heat|Bucks|Timberwolves|Wolves|Pelicans|Knicks|Thunder|Magic|76ers|Sixers|Suns|Trail Blazers|Blazers|Kings|Spurs|Raptors|Jazz|Wizards|ATL|BOS|BKN|CHA|CHI|CLE|DAL|DEN|DET|GSW|HOU|IND|LAC|LAL|MEM|MIA|MIL|MIN|NOP|NYK|OKC|ORL|PHI|PHX|POR|SAC|SAS|TOR|UTA|WAS)\b/g;


const CAP_FIGURES = [
    { label: 'SALARY CAP', value: '154.647', unit: 'M', color: COLORS.text },
    { label: 'LUXURY TAX', value: '187.895', unit: 'M', color: COLORS.amber },
    { label: 'FIRST APRON', value: '195.945', unit: 'M', color: COLORS.red },
    { label: 'SECOND APRON', value: '207.824', unit: 'M', color: COLORS.red },
];

const SUGGESTED = [
  "What are the Raptors' options this offseason?",
  "Explain max contract tiers",
  "What is the second apron and why does it matter?",
  "Are the Celtics in trouble with the luxury tax?",
  "What are Bird Rights?",
  "How does the trade aggregation rule work?",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');
const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const capPosition = (value) => Math.max(0, Math.min(100, (value - 100)));

// Mount-time anchor for the session uptime counter in the header.
const SESSION_START = Date.now();

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    fromRef.current = val;
    startRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(fromRef.current + (target - fromRef.current) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return val;
}

function CountUp({ value, decimals = 3, style }) {
  const v = useCountUp(value, 1100);
  return <span style={style}>{v.toFixed(decimals)}</span>;
}

// Tiny SVG sparkline showing a team's payroll position vs cap thresholds.
function Sparkline({ payroll, color, width = 92, height = 22 }) {
  const min = 100;
  const max = 215;
  const x = (v) => ((v - min) / (max - min)) * width;
  const points = [
    [0, height - 2],
    [x(CAP_LINES.cap) * 0.55, height - 8],
    [x(CAP_LINES.cap), height - 11],
    [x(CAP_LINES.tax), height - 14],
    [x(CAP_LINES.apron1), height - 17],
    [x(payroll), height - 19],
  ];
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const fill = `${d} L${x(payroll).toFixed(1)},${height} L0,${height} Z`;
  const px = x(payroll);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sparkfill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={x(CAP_LINES.cap)} y1="2" x2={x(CAP_LINES.cap)} y2={height - 2} stroke={COLORS.border} strokeWidth="1" strokeDasharray="2 2" />
      <line x1={x(CAP_LINES.tax)} y1="2" x2={x(CAP_LINES.tax)} y2={height - 2} stroke={COLORS.border} strokeWidth="1" strokeDasharray="2 2" />
      <line x1={x(CAP_LINES.apron1)} y1="2" x2={x(CAP_LINES.apron1)} y2={height - 2} stroke={COLORS.border} strokeWidth="1" strokeDasharray="2 2" />
      <path d={fill} fill={`url(#sparkfill-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px} cy={height - 19} r="2.4" fill={color} />
      <circle cx={px} cy={height - 19} r="4.5" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1" />
    </svg>
  );
}

function CornerBrackets({ color = COLORS.green, size = 8, opacity = 0.55 }) {
  const c = { position: 'absolute', width: size, height: size, borderColor: color, opacity, pointerEvents: 'none' };
  return (
    <>
      <span style={{ ...c, top: -1, left: -1, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ ...c, top: -1, right: -1, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <span style={{ ...c, bottom: -1, left: -1, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ ...c, bottom: -1, right: -1, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  );
}

function renderInline(text, openTeam, keyPrefix = '') {
  const boldSplit = text.split(/(\*\*[^*\n]+\*\*)/g);
  return boldSplit.map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}b${i}`} style={{ color: COLORS.text, fontWeight: 600 }}>
          {renderTeamsAndMoney(chunk.slice(2, -2), openTeam, `${keyPrefix}b${i}`, true)}
        </strong>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}t${i}`}>
        {renderTeamsAndMoney(chunk, openTeam, `${keyPrefix}t${i}`, false)}
      </React.Fragment>
    );
  });
}

function renderTeamsAndMoney(text, openTeam, keyPrefix, inBold) {
  if (typeof text !== 'string') return text;
  const teamParts = text.split(TEAM_PATTERN);
  return teamParts.map((part, i) => {
    if (TEAM_ALIASES[part]) {
      const teamKey = TEAM_ALIASES[part];
      return (
        <button
          key={`${keyPrefix}tm${i}`}
          onClick={() => openTeam(teamKey)}
          style={{
            all: 'unset',
            cursor: 'pointer',
            color: inBold ? COLORS.green : COLORS.greenDim,
            borderBottom: `1px dashed ${COLORS.green}55`,
            fontWeight: inBold ? 600 : 500,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COLORS.green;
            e.currentTarget.style.borderBottomColor = COLORS.green;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = inBold ? COLORS.green : COLORS.greenDim;
            e.currentTarget.style.borderBottomColor = `${COLORS.green}55`;
          }}
        >
          {part}
        </button>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}ns${i}`}>
        {highlightMoney(part, `${keyPrefix}ns${i}`)}
      </React.Fragment>
    );
  });
}

function highlightMoney(text, keyPrefix = '') {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\$[\d]+(?:\.\d+)?[MBK]?)/g);
  return parts.map((p, i) => {
    if (/^\$[\d]+(?:\.\d+)?[MBK]?$/.test(p)) {
      return (
        <span
          key={`${keyPrefix}m${i}`}
          style={{
            fontFamily: '"Space Mono", monospace',
            color: COLORS.green,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {p}
        </span>
      );
    }
    return <React.Fragment key={`${keyPrefix}p${i}`}>{p}</React.Fragment>;
  });
}

function renderContent(text, openTeam) {
  const blocks = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, bi) => {
    const lines = block.split('\n');
    const isList = lines.length > 1 && lines.every((l) => /^\s*[-*•]\s+/.test(l));

    if (isList) {
      return (
        <ul key={bi} style={{ margin: '10px 0', padding: 0, listStyle: 'none' }}>
          {lines.map((line, li) => (
            <li
              key={li}
              style={{
                display: 'flex',
                gap: 10,
                padding: '4px 0',
                alignItems: 'flex-start',
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  color: COLORS.green,
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 12,
                  marginTop: 3,
                  flexShrink: 0,
                }}
              >
                ▸
              </span>
              <span style={{ flex: 1 }}>
                {renderInline(line.replace(/^\s*[-*•]\s+/, ''), openTeam, `l${bi}${li}`)}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    if (block.startsWith('→')) {
      return (
        <div
          key={bi}
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: `1px dashed ${COLORS.border}`,
            color: COLORS.muted,
            fontStyle: 'italic',
            fontSize: 13.5,
            lineHeight: 1.55,
          }}
        >
          <span style={{ color: COLORS.green, marginRight: 6 }}>→</span>
          {renderInline(block.slice(1).trim(), openTeam, `fu${bi}`)}
        </div>
      );
    }

    return (
      <p key={bi} style={{ margin: '10px 0', lineHeight: 1.65 }}>
        {renderInline(block, openTeam, `p${bi}`)}
      </p>
    );
  });
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function Ticker({ onTeamClick, tickerItems }) {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div
      style={{
        borderTop: `1px solid ${COLORS.border}`,
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
        display: 'flex',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRight: `1px solid ${COLORS.border}`,
          background: COLORS.bg,
          fontFamily: '"Space Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.2em',
          color: COLORS.green,
          fontWeight: 700,
        }}
      >
        <span className="hb-pulse" style={{
          width: 6, height: 6, borderRadius: '50%',
          background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}`
        }} />
        LIVE TICKER
      </div>
      <div className="hb-marquee-wrap" style={{ flex: 1, overflow: 'hidden' }}>
        <div className="hb-marquee" style={{ display: 'inline-block' }}>
          {items.map((it, i) => {
            const clickable = Boolean(it.key);
            return (
              <span
                key={i}
                onClick={clickable ? () => onTeamClick(it.key) : undefined}
                className={clickable ? 'hb-ticker-clickable' : ''}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 22px',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 11.5,
                  letterSpacing: '0.08em',
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                }}
              >
                <span style={{ color: COLORS.dim }}>◆</span>
                <span style={{ color: COLORS.text, fontWeight: 700 }}>{it.t}</span>
                <span style={{ color: COLORS.muted }}>{it.p}</span>
                <span
                  style={{
                    color: it.c,
                    fontSize: 10,
                    padding: '2px 7px',
                    border: `1px solid ${it.c}33`,
                    background: `${it.c}0F`,
                    borderRadius: 2,
                  }}
                >
                  {it.s}
                </span>
                {clickable && (
                  <span style={{ color: COLORS.dim, fontSize: 10 }}>↗</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusLED({ label, color, delay = 0 }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: '"Space Mono", monospace',
        fontSize: 9.5,
        letterSpacing: '0.18em',
        color: COLORS.muted,
      }}
    >
      <span
        className="hb-pulse"
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}, 0 0 1px ${color}`,
          animationDelay: `${delay}s`,
        }}
      />
      <span style={{ color: COLORS.muted }}>{label}</span>
      <span style={{ color }}>OK</span>
    </div>
  );
}

function Header({ clock, uptime }) {
  return (
    <header
      style={{
        borderBottom: `1px solid ${COLORS.border}`,
        background: `linear-gradient(180deg, ${COLORS.surface} 0%, ${COLORS.bg} 100%)`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenDim} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 20px ${COLORS.green}40`,
          }}
        >
          <span
            style={{
              color: COLORS.bg,
              fontFamily: '"Space Mono", monospace',
              fontWeight: 700,
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            H
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: COLORS.text,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            HARDBALL
            <span
              className="hb-blink"
              style={{ color: COLORS.green, marginLeft: 4, fontWeight: 400 }}
            >
              █
            </span>
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.25em',
              color: COLORS.muted,
              fontFamily: '"Space Mono", monospace',
              marginTop: 2,
            }}
          >
            // NBA CAP INTELLIGENCE
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '6px 12px',
            border: `1px solid ${COLORS.border}`,
            background: COLORS.surface,
            borderRadius: 3,
          }}
        >
          <StatusLED label="FEED" color={COLORS.green} delay={0} />
          <span style={{ width: 1, height: 12, background: COLORS.border }} />
          <StatusLED label="NET" color={COLORS.blue} delay={0.4} />
          <span style={{ width: 1, height: 12, background: COLORS.border }} />
          <StatusLED label="SIG" color={COLORS.amber} delay={0.8} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 10px',
            border: `1px solid ${COLORS.green}40`,
            background: `${COLORS.green}0C`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span className="hb-scanbar" />
          <span
            className="hb-pulse"
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: COLORS.green,
              boxShadow: `0 0 8px ${COLORS.green}`,
            }}
          />
          <span
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: COLORS.green,
              fontWeight: 700,
            }}
          >
            LIVE · 25-26
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            lineHeight: 1.15,
            fontFamily: '"Space Mono", monospace',
          }}
        >
          <span style={{ fontSize: 12, color: COLORS.text, letterSpacing: '0.06em' }}>{clock}</span>
          <span style={{ fontSize: 9, color: COLORS.dim, letterSpacing: '0.2em' }}>
            UPTIME {uptime}
          </span>
        </div>
      </div>
    </header>
  );
}

function SystemBar({ uptime, queryCount, latency }) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.bg,
        padding: '4px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        fontFamily: '"Space Mono", monospace',
        fontSize: 9.5,
        letterSpacing: '0.18em',
        color: COLORS.dim,
      }}
      className="hb-scroll"
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.green }}>◉</span>
        <span style={{ color: COLORS.muted }}>SESSION</span>
        <span style={{ color: COLORS.text }}>HB-{SESSION_START.toString(16).slice(-6).toUpperCase()}</span>
      </span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.muted }}>LAT</span>
        <span style={{ color: COLORS.green }}>{latency}ms</span>
      </span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.muted }}>QRY</span>
        <span style={{ color: COLORS.text }}>{String(queryCount).padStart(3, '0')}</span>
      </span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.muted }}>UPTIME</span>
        <span style={{ color: COLORS.text }}>{uptime}</span>
      </span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.muted }}>FEED</span>
        <span style={{ color: COLORS.green }}>NBA·CBA·25-26</span>
      </span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.muted }}>VOL</span>
        <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1, height: 10 }}>
          {[3, 6, 4, 8, 5, 9, 7].map((h, i) => (
            <span
              key={i}
              className="hb-volbar"
              style={{
                width: 2,
                height: h,
                background: i % 2 ? COLORS.green : COLORS.greenDim,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </span>
      </span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.muted }}>MARKET</span>
        <span style={{ color: COLORS.green }}>OPEN</span>
      </span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: COLORS.muted }}>BUILD</span>
        <span style={{ color: COLORS.dim }}>0x{Math.floor(SESSION_START / 1000).toString(16).slice(-4).toUpperCase()}</span>
      </span>
    </div>
  );
}

function EmptyState({ onPickSuggestion, onTeamClick, teamData }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 20px' }}>
      <div
        style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.3em',
          color: COLORS.green,
          marginBottom: 14,
        }}
      >
        // SYSTEM READY
      </div>
      <h1
        className="hb-glitch"
        data-text="Ask anything about NBA contracts, cap rules, or trades."
        style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          lineHeight: 1.05,
          margin: 0,
          color: COLORS.text,
          letterSpacing: '-0.01em',
          position: 'relative',
        }}
      >
        Ask anything about{' '}
        <span
          style={{
            background: `linear-gradient(90deg, ${COLORS.green} 0%, ${COLORS.blue} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          NBA contracts,
        </span>
        <br />
        cap rules, or trades.
      </h1>
      <p
        style={{
          color: COLORS.muted,
          fontSize: 15,
          lineHeight: 1.6,
          marginTop: 18,
          maxWidth: 560,
        }}
      >
        Hardball is an analyst-grade engine for the NBA CBA. Salary cap, luxury tax,
        aprons, Bird Rights, trade math — answered with real figures and strategic
        context. Click any team below to open their cap sheet.
      </p>

      <div
        style={{
          position: 'relative',
          marginTop: 32,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          overflow: 'hidden',
          background: COLORS.surface,
        }}
      >
        <CornerBrackets color={COLORS.green} size={10} opacity={0.7} />
        <div
          style={{
            padding: '10px 14px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: '"Space Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: COLORS.muted,
          }}
        >
          <span>2024-25 KEY FIGURES</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1, height: 8 }}>
              {[2, 5, 3, 7, 4, 6].map((h, i) => (
                <span
                  key={i}
                  className="hb-volbar"
                  style={{ width: 2, height: h, background: COLORS.green, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </span>
            <span style={{ color: COLORS.green }}>● SRC: NBA CBA</span>
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          }}
        >
          {CAP_FIGURES.map((f, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                padding: '18px 16px',
                borderRight: i < CAP_FIGURES.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                overflow: 'hidden',
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(180deg, ${f.color}10 0%, transparent 80%)`,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  color: COLORS.muted,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{f.label}</span>
                <span style={{ color: f.color, fontSize: 8 }}>▲</span>
              </div>
              <div
                style={{
                  position: 'relative',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 22,
                  fontWeight: 700,
                  color: f.color,
                  letterSpacing: '-0.02em',
                  textShadow: `0 0 18px ${f.color}33`,
                }}
              >
                <span style={{ color: COLORS.muted, fontSize: 14, marginRight: 2 }}>$</span>
                <CountUp value={parseFloat(f.value)} decimals={3} />
                <span style={{ color: COLORS.muted, fontSize: 14, marginLeft: 2 }}>{f.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          fontFamily: '"Space Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.22em',
          color: COLORS.muted,
          marginBottom: 10,
        }}
      >
        // SCAN TEAMS
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
        }}
      >
        {Object.values(teamData).map((team) => (
          <button
            key={team.abbr}
            onClick={() => onTeamClick(team.abbr)}
            className="hb-team-card"
            style={{
              all: 'unset',
              cursor: 'pointer',
              position: 'relative',
              padding: '12px 14px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 4,
              background: COLORS.surface,
              transition: 'all 0.18s ease',
              overflow: 'hidden',
            }}
          >
            <span className="hb-card-scan" aria-hidden />
            <CornerBrackets color={team.statusColor} size={6} opacity={0.4} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: COLORS.text,
                }}
              >
                {team.abbr}
              </span>
              <span
                style={{
                  color: team.statusColor,
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 9,
                  padding: '1px 6px',
                  border: `1px solid ${team.statusColor}33`,
                  background: `${team.statusColor}0F`,
                  borderRadius: 2,
                  letterSpacing: '0.1em',
                }}
              >
                {team.status}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 16,
                  color: team.statusColor,
                  fontWeight: 700,
                  textShadow: `0 0 12px ${team.statusColor}33`,
                }}
              >
                ${team.payroll.toFixed(1)}M
              </div>
              <Sparkline payroll={team.payroll} color={team.statusColor} />
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 28,
          fontFamily: '"Space Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.22em',
          color: COLORS.muted,
          marginBottom: 12,
        }}
      >
        // START WITH
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SUGGESTED.slice(0, 4).map((s, i) => (
          <button
            key={i}
            onClick={() => onPickSuggestion(s)}
            className="hb-suggest"
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 4,
              background: COLORS.surface,
              color: COLORS.text,
              fontSize: 14,
              transition: 'all 0.18s ease',
            }}
          >
            <span
              style={{
                color: COLORS.green,
                fontFamily: '"Space Mono", monospace',
                fontSize: 12,
              }}
            >
              &gt;
            </span>
            <span style={{ flex: 1 }}>{s}</span>
            <span
              className="hb-suggest-arrow"
              style={{
                color: COLORS.muted,
                fontFamily: '"Space Mono", monospace',
                transition: 'all 0.18s ease',
              }}
            >
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function UserMessage({ msg }) {
  return (
    <div
      className="hb-fadein"
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 24,
      }}
    >
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: COLORS.muted,
            marginBottom: 6,
          }}
        >
          YOU · {msg.time}
        </div>
        <div
          style={{
            borderRight: `2px solid ${COLORS.blue}`,
            background: `${COLORS.blue}0C`,
            padding: '12px 16px',
            borderRadius: '4px 0 0 4px',
            color: COLORS.text,
            fontSize: 14.5,
            lineHeight: 1.55,
          }}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

function AiMessage({ msg, index, openTeam }) {
  return (
    <div className="hb-fadein" style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
          fontFamily: '"Space Mono", monospace',
          fontSize: 10.5,
          letterSpacing: '0.18em',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: COLORS.green }}>■</span>
        <span style={{ color: COLORS.text, fontWeight: 700 }}>HARDBALL</span>
        <span style={{ color: COLORS.dim }}>·</span>
        <span style={{ color: COLORS.muted }}>BRIEF #{String(index + 1).padStart(3, '0')}</span>
        <span style={{ color: COLORS.dim }}>·</span>
        <span style={{ color: COLORS.muted }}>{msg.time}</span>
        {msg.error && (
          <>
            <span style={{ color: COLORS.dim }}>·</span>
            <span style={{ color: COLORS.red }}>ERR</span>
          </>
        )}
      </div>
      <div
        style={{
          borderLeft: `2px solid ${msg.error ? COLORS.red : COLORS.green}`,
          paddingLeft: 18,
          color: COLORS.text,
          fontSize: 14.5,
        }}
      >
        {msg.error ? (
          <p style={{ margin: 0, color: COLORS.red }}>{msg.content}</p>
        ) : (
          renderContent(msg.content, openTeam)
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="hb-fadein" style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
          fontFamily: '"Space Mono", monospace',
          fontSize: 10.5,
          letterSpacing: '0.18em',
        }}
      >
        <span style={{ color: COLORS.green }}>
          <Activity size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </span>
        <span style={{ color: COLORS.text, fontWeight: 700 }}>HARDBALL</span>
        <span style={{ color: COLORS.dim }}>·</span>
        <span style={{ color: COLORS.green }}>ANALYZING</span>
      </div>
      <div
        style={{
          borderLeft: `2px solid ${COLORS.green}`,
          paddingLeft: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0 4px 18px',
        }}
      >
        <span className="hb-dot" style={{ background: COLORS.green }} />
        <span className="hb-dot" style={{ background: COLORS.green, animationDelay: '0.18s' }} />
        <span className="hb-dot" style={{ background: COLORS.green, animationDelay: '0.36s' }} />
      </div>
    </div>
  );
}

function CapPositionBar({ payroll }) {
  const teamPct = capPosition(payroll);
  const capPct = capPosition(CAP_LINES.cap);
  const taxPct = capPosition(CAP_LINES.tax);
  const a1Pct = capPosition(CAP_LINES.apron1);
  const a2Pct = capPosition(CAP_LINES.apron2);

  let teamColor = COLORS.green;
  if (payroll > CAP_LINES.apron2) teamColor = COLORS.red;
  else if (payroll > CAP_LINES.apron1) teamColor = COLORS.red;
  else if (payroll > CAP_LINES.tax) teamColor = COLORS.amber;
  else if (payroll > CAP_LINES.cap) teamColor = COLORS.blue;

  const markers = [
    { pct: capPct, label: 'CAP', value: CAP_LINES.cap, color: COLORS.blue },
    { pct: taxPct, label: 'TAX', value: CAP_LINES.tax, color: COLORS.amber },
    { pct: a1Pct, label: 'A1', value: CAP_LINES.apron1, color: COLORS.red },
    { pct: a2Pct, label: 'A2', value: CAP_LINES.apron2, color: COLORS.red },
  ];

  return (
    <div style={{ position: 'relative', height: 72, marginTop: 8, marginBottom: 4 }}>
      <div
        style={{
          position: 'absolute',
          left: `${teamPct}%`,
          transform: 'translateX(-50%)',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 3,
        }}
      >
        <div
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: 11,
            fontWeight: 700,
            color: teamColor,
            whiteSpace: 'nowrap',
            marginBottom: 2,
          }}
        >
          ${payroll.toFixed(1)}M
        </div>
        <div style={{ color: teamColor, lineHeight: 0.6, fontSize: 14 }}>▼</div>
      </div>

      <div style={{ position: 'absolute', top: 38, left: 0, right: 0, height: 4, background: COLORS.border, borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: 38, left: `${capPct}%`, width: `${taxPct - capPct}%`, height: 4, background: `${COLORS.blue}55` }} />
      <div style={{ position: 'absolute', top: 38, left: `${taxPct}%`, width: `${a1Pct - taxPct}%`, height: 4, background: `${COLORS.amber}55` }} />
      <div style={{ position: 'absolute', top: 38, left: `${a1Pct}%`, width: `${a2Pct - a1Pct}%`, height: 4, background: `${COLORS.red}55` }} />
      <div style={{ position: 'absolute', top: 38, left: `${a2Pct}%`, right: 0, height: 4, background: `${COLORS.red}88` }} />

      {markers.map((m, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${m.pct}%`,
            top: 34,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <div style={{ width: 1, height: 12, background: m.color, opacity: 0.8 }} />
          <div
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: m.color,
              marginTop: 4,
              fontWeight: 700,
            }}
          >
            {m.label}
          </div>
        </div>
      ))}

      <div style={{ position: 'absolute', bottom: 0, left: 0, fontFamily: '"Space Mono", monospace', fontSize: 9, color: COLORS.dim }}>$100M</div>
      <div style={{ position: 'absolute', bottom: 0, right: 0, fontFamily: '"Space Mono", monospace', fontSize: 9, color: COLORS.dim }}>$200M</div>
    </div>
  );
}

function TeamDrawer({ teamKey, onClose, onAsk, teamData }) {
  const team = teamData[teamKey];
  if (!team) return null;

  const teamShort = team.name.replace(/^.*\s/, '');
  const quickActions = [
    `Analyze the ${teamShort} cap situation and what they can do next`,
    `What are the ${teamShort} best offseason moves?`,
    `Who on the ${teamShort} is extension-eligible next?`,
    `Explain the apron restrictions affecting the ${teamShort}`,
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div
        className="hb-drawer-backdrop"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <div
        className="hb-drawer-in hb-scroll"
        style={{
          position: 'relative',
          width: 'min(540px, 100vw)',
          height: '100vh',
          overflowY: 'auto',
          background: COLORS.bg,
          borderLeft: `1px solid ${COLORS.border}`,
          boxShadow: `-20px 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            padding: '16px 20px',
            borderBottom: `1px solid ${COLORS.border}`,
            background: `linear-gradient(180deg, ${COLORS.surface} 0%, ${COLORS.bg} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.22em',
                color: COLORS.green,
              }}
            >
              // TEAM BRIEF
            </div>
          </div>
          <button
            onClick={onClose}
            className="hb-close"
            style={{
              all: 'unset',
              cursor: 'pointer',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.muted,
              transition: 'all 0.15s ease',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: COLORS.text,
              }}
            >
              {team.abbr}
            </span>
            <span
              style={{
                color: team.statusColor,
                fontFamily: '"Space Mono", monospace',
                fontSize: 10,
                padding: '3px 8px',
                border: `1px solid ${team.statusColor}55`,
                background: `${team.statusColor}0F`,
                borderRadius: 2,
                letterSpacing: '0.15em',
                fontWeight: 700,
              }}
            >
              {team.status}
            </span>
          </div>
          <h2 style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 500, color: COLORS.text, letterSpacing: '-0.01em' }}>
            {team.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 18 }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '0.2em', color: COLORS.muted }}>
              24-25 PAYROLL
            </div>
          </div>
          <div
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 36,
              fontWeight: 700,
              color: team.statusColor,
              letterSpacing: '-0.02em',
              marginTop: 2,
            }}
          >
            <span style={{ color: COLORS.muted, fontSize: 20, marginRight: 2 }}>$</span>
            {team.payroll.toFixed(1)}
            <span style={{ color: COLORS.muted, fontSize: 20, marginLeft: 2 }}>M</span>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 4,
            }}
          >
            <div
              style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: 9,
                letterSpacing: '0.2em',
                color: COLORS.muted,
                marginBottom: 4,
              }}
            >
              CAP POSITION · 24-25
            </div>
            <CapPositionBar payroll={team.payroll} />
          </div>

          <p style={{ margin: '18px 0 0', color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>
            {team.summary}
          </p>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: COLORS.muted,
              marginTop: 8,
              marginBottom: 10,
            }}
          >
            // KEY CONTRACTS
          </div>
          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 4,
              overflow: 'hidden',
              background: COLORS.surface,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 12,
                padding: '8px 14px',
                borderBottom: `1px solid ${COLORS.border}`,
                background: COLORS.bg,
                fontFamily: '"Space Mono", monospace',
                fontSize: 9,
                letterSpacing: '0.18em',
                color: COLORS.muted,
              }}
            >
              <span>PLAYER</span>
              <span style={{ textAlign: 'right' }}>SALARY</span>
              <span style={{ textAlign: 'right' }}>YRS</span>
            </div>
            {team.roster.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  borderBottom: i < team.roster.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 12,
                  alignItems: 'center',
                  fontSize: 13.5,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ color: COLORS.text, fontWeight: 500 }}>{p.name}</span>
                  {p.note && (
                    <span
                      style={{
                        fontFamily: '"Space Mono", monospace',
                        fontSize: 10,
                        color: COLORS.dim,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {p.note}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: '"Space Mono", monospace',
                    color: COLORS.green,
                    fontWeight: 700,
                    textAlign: 'right',
                  }}
                >
                  ${p.salary.toFixed(1)}M
                </span>
                <span
                  style={{
                    fontFamily: '"Space Mono", monospace',
                    color: COLORS.muted,
                    fontSize: 12,
                    textAlign: 'right',
                    width: 24,
                  }}
                >
                  {p.yrs}y
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '22px 20px 0' }}>
          <div
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: COLORS.muted,
              marginBottom: 10,
            }}
          >
            // STRATEGIC NOTES
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {team.notes.map((n, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '6px 0',
                  color: COLORS.text,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    color: team.statusColor,
                    fontFamily: '"Space Mono", monospace',
                    fontSize: 11,
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                >
                  ▸
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '22px 20px 28px' }}>
          <div
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: COLORS.muted,
              marginBottom: 10,
            }}
          >
            // ASK HARDBALL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {quickActions.map((q, i) => (
              <button
                key={i}
                onClick={() => onAsk(q)}
                className="hb-ask-btn"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 13px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 4,
                  background: COLORS.surface,
                  color: COLORS.text,
                  fontSize: 13.5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    color: COLORS.green,
                    fontFamily: '"Space Mono", monospace',
                    fontSize: 11,
                  }}
                >
                  &gt;
                </span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{q}</span>
                <ChevronRight size={14} color={COLORS.muted} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Hardball() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clock, setClock] = useState(fmtTime(new Date()));
  const [uptime, setUptime] = useState('00:00:00');
  const [latency, setLatency] = useState(42);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [teamData, setTeamData] = useState({});
  const [tickerItems, setTickerItems] = useState([]);

    useEffect(() => {
        // Fetch team summaries once on mount
        // Sprint 4: fetch the full 30-team list from the backend on mount
      fetch(`${API_BASE}/api/teams`)
            .then((r) => r.json())
            .then(async (data) => {
                // Hydrate the top 5 teams (by payroll) for ticker
                const top5 = data.teams.slice(0, 5);
                const ticker = top5.map((t) => ({
                    t: t.abbr,
                    p: `$${t.payroll.toFixed(1)}M`,
                    s: t.status,
                    c: statusColor(t.status),
                    key: t.abbr,
                }));
                // Add the cap-threshold static items
                ticker.push(
                    { t: 'CAP', p: '$154.647M', s: '25-26', c: COLORS.blue },
                    { t: 'TAX', p: '$187.895M', s: 'LINE', c: COLORS.amber },
                    { t: 'APRON 2', p: '$207.824M', s: 'HARD', c: COLORS.red },
                );
                setTickerItems(ticker);

                // Fetch full detail for every team (parallel)
                const fullData = await Promise.all(
                    data.teams.map((t) =>
                        fetch(`${API_BASE}/api/teams/${t.abbr}`)
                            .then((r) => r.json())
                            .then((team) => ({ ...team, statusColor: statusColor(team.status) }))
                    )
                );
                const map = {};
                fullData.forEach((t) => { map[t.abbr] = t; });
                setTeamData(map);
            })
            .catch((err) => {
                console.error('Failed to load team data:', err);
            });
    }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setClock(fmtTime(now));
      const elapsed = Math.floor((Date.now() - SESSION_START) / 1000);
      const h = pad(Math.floor(elapsed / 3600));
      const m = pad(Math.floor((elapsed % 3600) / 60));
      const s = pad(elapsed % 60);
      setUptime(`${h}:${m}:${s}`);
      setLatency(38 + Math.floor(Math.random() * 14));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (selectedTeam) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [selectedTeam]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedTeam) setSelectedTeam(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTeam]);

  // ─── Updated send() — calls Flask backend instead of Anthropic directly ──
  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text, time: fmtTime(new Date()) };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = (data.reply || '').trim();
      if (!reply) throw new Error('Empty response');

      setMessages([
        ...next,
        { role: 'assistant', content: reply, time: fmtTime(new Date()) },
      ]);
    } catch (err) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: 'TRANSMISSION ERROR. The analyst feed is unreachable. Please retry.',
          time: fmtTime(new Date()),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const pickSuggestion = (s) => {
    setInput(s);
    if (inputRef.current) inputRef.current.focus();
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const openTeam = (key) => setSelectedTeam(key);

  const askFromDrawer = (q) => {
    setSelectedTeam(null);
    send(q);
  };

  const aiIndexMap = {};
  let aiCount = -1;
  messages.forEach((m, i) => {
    if (m.role === 'assistant') {
      aiCount += 1;
      aiIndexMap[i] = aiCount;
    }
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; }

        @keyframes hbFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hb-fadein { animation: hbFadeIn 0.38s ease-out both; }

        @keyframes hbBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .hb-blink { animation: hbBlink 1.1s steps(1) infinite; }

        @keyframes hbPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.35); }
        }
        .hb-pulse { animation: hbPulse 1.6s ease-in-out infinite; }

        @keyframes hbMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hb-marquee { animation: hbMarquee 60s linear infinite; }
        .hb-marquee-wrap:hover .hb-marquee { animation-play-state: paused; }

        .hb-ticker-clickable:hover { background: ${COLORS.surfaceHi}; }

        @keyframes hbDot {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        .hb-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: hbDot 1.2s ease-in-out infinite;
        }

        .hb-suggest:hover {
          background: ${COLORS.surfaceHi} !important;
          border-color: ${COLORS.green}66 !important;
          transform: translateX(2px);
        }
        .hb-suggest:hover .hb-suggest-arrow {
          color: ${COLORS.green} !important;
          transform: translateX(2px);
        }

        .hb-chip:hover {
          background: ${COLORS.surfaceHi} !important;
          border-color: ${COLORS.green}66 !important;
          color: ${COLORS.text} !important;
        }

        .hb-team-card:hover {
          background: ${COLORS.surfaceHi} !important;
          border-color: ${COLORS.green}66 !important;
          transform: translateY(-1px);
        }

        .hb-ask-btn:hover {
          background: ${COLORS.surfaceHi} !important;
          border-color: ${COLORS.green}66 !important;
          transform: translateX(2px);
        }

        .hb-close:hover {
          border-color: ${COLORS.green}66 !important;
          color: ${COLORS.green} !important;
        }

        .hb-scroll::-webkit-scrollbar { width: 8px; }
        .hb-scroll::-webkit-scrollbar-track { background: transparent; }
        .hb-scroll::-webkit-scrollbar-thumb {
          background: ${COLORS.border};
          border-radius: 4px;
        }
        .hb-scroll::-webkit-scrollbar-thumb:hover { background: ${COLORS.borderHi}; }

        .hb-input:focus { outline: none; }
        .hb-input-wrap:focus-within {
          border-color: ${COLORS.green}99 !important;
          box-shadow: 0 0 0 3px ${COLORS.green}14 !important;
        }

        .hb-send:not(:disabled):hover {
          background: ${COLORS.green} !important;
          color: ${COLORS.bg} !important;
          box-shadow: 0 0 20px ${COLORS.green}55 !important;
        }

        @keyframes hbDrawerIn {
          from { transform: translateX(100%); opacity: 0.4; }
          to { transform: translateX(0); opacity: 1; }
        }
        .hb-drawer-in { animation: hbDrawerIn 0.34s cubic-bezier(0.22, 1, 0.36, 1); }

        @keyframes hbBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hb-drawer-backdrop { animation: hbBackdropIn 0.25s ease-out; }

        .hb-grid-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(${COLORS.green}08 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.green}08 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
        }

        /* CRT scanlines overlay across main feed */
        .hb-scanlines::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.018) 0,
            rgba(255,255,255,0.018) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
          z-index: 50;
          mix-blend-mode: overlay;
        }

        /* Slow radar sweep behind grid */
        @keyframes hbRadar {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .hb-radar::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 1400px;
          height: 1400px;
          background: conic-gradient(
            from 0deg,
            ${COLORS.green}12 0deg,
            ${COLORS.green}06 18deg,
            transparent 60deg,
            transparent 360deg
          );
          transform: translate(-50%, -50%) rotate(0deg);
          animation: hbRadar 22s linear infinite;
          pointer-events: none;
          mask-image: radial-gradient(circle at center, black 0%, transparent 60%);
          -webkit-mask-image: radial-gradient(circle at center, black 0%, transparent 60%);
          opacity: 0.55;
        }

        /* Glitch headline */
        @keyframes hbGlitchTop {
          0%, 92%, 100% { clip-path: inset(0 0 0 0); transform: translate(0,0); }
          93% { clip-path: inset(0 0 60% 0); transform: translate(-2px, -1px); }
          95% { clip-path: inset(40% 0 0 0); transform: translate(2px, 1px); }
          97% { clip-path: inset(20% 0 50% 0); transform: translate(-1px, 1px); }
        }
        @keyframes hbGlitchBot {
          0%, 92%, 100% { clip-path: inset(0 0 0 0); transform: translate(0,0); }
          93% { clip-path: inset(60% 0 0 0); transform: translate(2px, 1px); }
          95% { clip-path: inset(0 0 40% 0); transform: translate(-2px, -1px); }
          97% { clip-path: inset(50% 0 20% 0); transform: translate(1px, -1px); }
        }
        .hb-glitch::before,
        .hb-glitch::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
        }
        .hb-glitch:hover::before {
          color: ${COLORS.red};
          opacity: 0.7;
          animation: hbGlitchTop 1.6s steps(2, end) infinite;
          mix-blend-mode: screen;
        }
        .hb-glitch:hover::after {
          color: ${COLORS.blue};
          opacity: 0.7;
          animation: hbGlitchBot 1.6s steps(2, end) infinite;
          mix-blend-mode: screen;
        }

        /* Scan beam sweeping inside the LIVE pill */
        @keyframes hbScanBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .hb-scanbar {
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, ${COLORS.green}33 50%, transparent 100%);
          animation: hbScanBar 2.8s ease-in-out infinite;
          pointer-events: none;
        }

        /* Vol-bar pulse */
        @keyframes hbVolPulse {
          0%, 100% { transform: scaleY(0.45); opacity: 0.5; }
          50%      { transform: scaleY(1);    opacity: 1; }
        }
        .hb-volbar {
          display: inline-block;
          transform-origin: bottom;
          animation: hbVolPulse 1.4s ease-in-out infinite;
        }

        /* Border-scan beam on team cards (revealed on hover) */
        @keyframes hbCardScan {
          0%   { transform: translateX(-100%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        .hb-card-scan {
          position: absolute;
          top: 0;
          left: 0;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            ${COLORS.green}1A 35%,
            ${COLORS.green}33 50%,
            ${COLORS.green}1A 65%,
            transparent 100%
          );
          opacity: 0;
          pointer-events: none;
        }
        .hb-team-card:hover .hb-card-scan {
          animation: hbCardScan 1.1s ease-out;
        }
        .hb-team-card:hover {
          box-shadow: 0 0 0 1px ${COLORS.green}33, 0 8px 24px ${COLORS.green}0F;
        }
      `}</style>

      <Header clock={clock} uptime={uptime} />
      <Ticker onTeamClick={openTeam} tickerItems={tickerItems} />
      <SystemBar
        uptime={uptime}
        queryCount={messages.filter((m) => m.role === 'user').length}
        latency={latency}
      />

      <main
        ref={scrollRef}
        className="hb-scroll hb-grid-bg hb-scanlines hb-radar"
        style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          {messages.length === 0 ? (
            <EmptyState onPickSuggestion={pickSuggestion} onTeamClick={openTeam} teamData={teamData} />
          ) : (
            <div style={{ maxWidth: 820, margin: '0 auto', padding: '30px 20px 20px' }}>
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <UserMessage key={i} msg={m} />
                ) : (
                  <AiMessage key={i} msg={m} index={aiIndexMap[i]} openTeam={openTeam} />
                )
              )}
              {loading && <TypingIndicator />}
            </div>
          )}
        </div>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.surface} 100%)`,
          padding: '14px 20px 18px',
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div
            className="hb-scroll"
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 12,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {SUGGESTED.map((s, i) => (
              <button
                key={i}
                onClick={() => pickSuggestion(s)}
                className="hb-chip"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '7px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 3,
                  background: COLORS.surface,
                  color: COLORS.muted,
                  fontSize: 12,
                  fontFamily: '"Space Mono", monospace',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: COLORS.green, marginRight: 6 }}>&gt;</span>
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            <div
              className="hb-input-wrap"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 14px',
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
                transition: 'all 0.18s ease',
              }}
            >
              <span
                style={{
                  color: COLORS.green,
                  fontFamily: '"Space Mono", monospace',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                &gt;
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask about any contract, cap rule, or trade scenario…"
                disabled={loading}
                className="hb-input"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: COLORS.text,
                  fontSize: 14.5,
                  padding: '14px 0',
                  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                }}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="hb-send"
              style={{
                all: 'unset',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '0 18px',
                background: COLORS.surface,
                border: `1px solid ${COLORS.green}66`,
                color: COLORS.green,
                borderRadius: 4,
                fontFamily: '"Space Mono", monospace',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.15em',
                transition: 'all 0.18s ease',
                minWidth: 90,
              }}
            >
              <Send size={14} />
              SEND
            </button>
          </div>

          <div
            style={{
              marginTop: 10,
              fontFamily: '"Space Mono", monospace',
              fontSize: 10,
              color: COLORS.dim,
              letterSpacing: '0.15em',
              textAlign: 'center',
            }}
          >
            HARDBALL // ANALYST ENGINE · NOT FINANCIAL ADVICE · 2025-26 CBA
          </div>
        </div>
      </footer>

      {selectedTeam && (
        <TeamDrawer
          teamKey={selectedTeam} teamData={teamData}
          onClose={() => setSelectedTeam(null)}
          onAsk={askFromDrawer}
        />
      )}
    </div>
  );
}
