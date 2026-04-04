// Hardball — NBA cap intelligence
// Initial artifact pasted from Claude. Single file, no build step yet.
// Renders inside a host page that provides React 18 + ReactDOM globals.

import React, { useState, useRef, useEffect } from 'react';

// Direct call to Anthropic — temporary while this is still a sandbox artifact.
// TODO: move to a backend before any kind of public demo (the API key would
// otherwise ship in the JS bundle).
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// 5 hand-curated teams to demo with. Will outgrow this fast.
const TEAM_DATA = {
  LAL: { name: 'Los Angeles Lakers', payroll: 195.3 },
  BOS: { name: 'Boston Celtics',     payroll: 187.3 },
  TOR: { name: 'Toronto Raptors',    payroll: 193.4 },
  GSW: { name: 'Golden State',       payroll: 204.4 },
  OKC: { name: 'Oklahoma City',      payroll: 187.2 },
};

const SUGGESTED = [
  'What is the second apron?',
  'Who is hard-capped this year?',
  'How do Bird Rights work?',
];

export default function Hardball() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(text) {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    // (Anthropic call omitted in this snippet — see ANTHROPIC_URL above.)
    setBusy(false);
  }

  return (
    <div className="hardball">
      <header>
        <span className="brand">HARDBALL</span>
        <span className="season">2024-25 SEASON</span>
      </header>
      <main>
        {messages.length === 0 ? (
          <div className="empty">
            <h1>Ask me about the NBA cap.</h1>
            <ul>
              {SUGGESTED.map(s => (
                <li key={s}><button onClick={() => send(s)}>{s}</button></li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="messages">
            {messages.map((m, i) => <li key={i} className={m.role}>{m.content}</li>)}
          </ul>
        )}
      </main>
      <form onSubmit={e => { e.preventDefault(); send(input); }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about contracts, the apron, trades..." />
        <button type="submit" disabled={busy}>Send</button>
      </form>
    </div>
  );
}


// ─── LIVE TICKER ─────────────────────────────────────────────────────────────
// Scrolling marquee of cap figures across the top of the app. Pure CSS
// animation; the strip duplicates itself so the loop is seamless.

const TICKER = Object.entries(TEAM_DATA).flatMap(([abbr, t]) => [
  `${abbr} $${t.payroll.toFixed(1)}M`,
]);

export function Ticker() {
  return (
    <div className="ticker">
      <span className="label">LIVE TICKER</span>
      <div className="ticker-track">
        {[...TICKER, ...TICKER].map((s, i) => (
          <span key={i} className="ticker-item">{s}</span>
        ))}
      </div>
    </div>
  );
}


// ─── TEAM DRAWER ─────────────────────────────────────────────────────────────
// Slide-in side panel with the full roster, contract notes, and a
// cap-position visualizer (horizontal bar with threshold markers).

const THRESHOLDS = { cap: 154.6, tax: 187.9, apron1: 195.9, apron2: 207.8 };

export function TeamDrawer({ abbr, onClose }) {
  const team = TEAM_DATA[abbr];
  if (!team) return null;
  // Escape-key dismiss + body scroll lock
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <aside className="drawer">
      <header>
        <h2>{abbr} — {team.name}</h2>
        <button onClick={onClose}>×</button>
      </header>
      <CapBar payroll={team.payroll} thresholds={THRESHOLDS} />
    </aside>
  );
}

// Cap-position visualizer — second iteration. The first version was a single
// bar with vertical marker lines; you had to math out which threshold the
// team had crossed. This one fills colored segments between thresholds, which
// makes the apron tiers visceral at a glance.
export function CapBar({ payroll, thresholds }) {
  const max = thresholds.apron2 + 15;
  const seg = (lo, hi, cls) => (
    <div className={`seg ${cls}`}
         style={{ left: `${(lo / max) * 100}%`,
                  width: `${((hi - lo) / max) * 100}%` }} />
  );
  return (
    <div className="capbar" aria-label={`Payroll $${payroll.toFixed(1)}M`}>
      {seg(0, thresholds.cap,    'under-cap')}
      {seg(thresholds.cap, thresholds.tax,    'under-tax')}
      {seg(thresholds.tax, thresholds.apron1, 'under-apron1')}
      {seg(thresholds.apron1, thresholds.apron2, 'under-apron2')}
      {seg(thresholds.apron2, max, 'over-apron2')}
      <div className="payroll-marker" style={{ left: `${(payroll / max) * 100}%` }} />
    </div>
  );
}
