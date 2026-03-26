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
