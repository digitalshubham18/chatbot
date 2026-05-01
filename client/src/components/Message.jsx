import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const initials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const fmt = ts => {
  try { return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

export default function Message({ msg, onRegenerate }) {
  const { user } = useAuth();
  const isUser   = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const download = () => {
    const blob = new Blob([msg.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'VakilAI-advice.txt';
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className={`msg ${msg.role}`}>
      <div className="av">
        {isUser ? initials(user?.name) : '⚖️'}
      </div>
      <div className="bubble-wrap">
        <div className="bubble-meta">
          <span className="bubble-name">{isUser ? (user?.name || 'You') : 'VakilAI'}</span>
          {msg.timestamp && <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>{fmt(msg.timestamp)}</span>}
        </div>
        <div className="bubble">
          {isUser
            ? <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            : <ReactMarkdown>{msg.content}</ReactMarkdown>
          }
        </div>
        {!isUser && (
          <div className="bubble-actions" style={{ marginTop: 8 }}>
            <button className="bubble-action-btn" onClick={copy}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button className="bubble-action-btn" onClick={download}>
              ↓ Save
            </button>
            {onRegenerate && (
              <button className="bubble-action-btn" onClick={onRegenerate}>
                ↺ Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Typing() {
  return (
    <div className="typing">
      <div className="av" style={{ background: 'linear-gradient(145deg,var(--ink-700),var(--ink-600))', border: '1px solid var(--border-2)', fontSize: '1rem' }}>⚖️</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '.72rem', color: 'var(--gold-300)', marginBottom: 2 }}>VakilAI is researching…</span>
        <div className="typing-bubble">
          <div className="dot" /><div className="dot" /><div className="dot" />
        </div>
      </div>
    </div>
  );
}
