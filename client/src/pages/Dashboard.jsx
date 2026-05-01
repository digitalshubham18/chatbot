import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Message, { Typing } from '../components/Message';
import WelcomeScreen from '../components/WelcomeScreen';
import TemplatesModal from '../components/TemplatesModal';
import EmergencyModal from '../components/EmergencyModal';

const API_BASE = '/api';
const getToken = () => localStorage.getItem('lx_token');

async function* parseSSE(body) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let eventName = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (line.startsWith('event: ')) { eventName = line.slice(7).trim(); }
      else if (line.startsWith('data: ')) {
        try { const payload = JSON.parse(line.slice(6)); yield { event: eventName, payload }; } catch {}
        eventName = '';
      }
    }
  }
}

export default function Dashboard() {
  const [convs,       setConvs]       = useState([]);
  const [activeId,    setActiveId]    = useState(null);
  const [msgs,        setMsgs]        = useState([]);
  const [title,       setTitle]       = useState('New Consultation');
  const [input,       setInput]       = useState('');
  const [streaming,   setStreaming]   = useState(false);
  const [streamText,  setStreamText]  = useState('');
  const [error,       setError]       = useState('');
  const [sbOpen,      setSbOpen]      = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [recording,   setRecording]   = useState(false);

  const bottomRef  = useRef(null);
  const taRef      = useRef(null);
  const abortRef   = useRef(null);
  const recognRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, streamText]);
  useEffect(() => { fetchHistory(); return () => abortRef.current?.abort(); }, []);

  const fetchHistory = async () => {
    try {
      const r = await fetch(`${API_BASE}/chat/history`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (r.ok) { const d = await r.json(); setConvs(d.conversations || []); }
    } catch {}
  };

  const selectConv = async (id) => {
    try {
      setError('');
      const r = await fetch(`${API_BASE}/chat/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!r.ok) throw new Error();
      const { conversation: c } = await r.json();
      setActiveId(c._id); setMsgs(c.messages || []); setTitle(c.title);
      setSbOpen(false);
    } catch { setError('Could not load conversation.'); }
  };

  const newChat = () => {
    abortRef.current?.abort();
    setActiveId(null); setMsgs([]); setTitle('New Consultation');
    setError(''); setInput(''); setStreaming(false); setStreamText('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const deleteConv = async (id) => {
    try {
      await fetch(`${API_BASE}/chat/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      setConvs(p => p.filter(c => c._id !== id));
      if (activeId === id) newChat();
    } catch { setError('Could not delete.'); }
  };

  const pinConv = async (id) => {
    try {
      const r = await fetch(`${API_BASE}/chat/${id}/pin`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
      if (r.ok) {
        const { pinned } = await r.json();
        setConvs(p => p.map(c => c._id === id ? { ...c, pinned } : c));
      }
    } catch {}
  };

  const clearAll = async () => {
    try {
      await fetch(`${API_BASE}/chat/all`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      setConvs([]); newChat();
    } catch { setError('Could not clear history.'); }
  };

  const send = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setInput(''); setError(''); setStreamText('');
    if (taRef.current) taRef.current.style.height = 'auto';

    const tempId = `tmp-${Date.now()}`;
    setMsgs(p => [...p, { _id: tempId, role: 'user', content, timestamp: new Date().toISOString() }]);
    setStreaming(true);

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ message: content, conversationId: activeId }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error(`Server error ${res.status}`);

      for await (const { event, payload } of parseSSE(res.body)) {
        if (ctrl.signal.aborted) break;
        if (event === 'chunk') {
          setStreamText(prev => prev + (payload.text || ''));
        } else if (event === 'done') {
          const { conversationId: cid, title: newTitle, userMessage, botMessage } = payload;
          setMsgs(p => [...p.filter(m => m._id !== tempId), userMessage, botMessage]);
          setStreamText(''); setStreaming(false);
          setActiveId(cid); setTitle(newTitle);
          setConvs(p => {
            const exists = p.find(c => c._id === cid);
            const updated = exists
              ? p.map(c => c._id === cid ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c)
              : [{ _id: cid, title: newTitle, updatedAt: new Date().toISOString(), messages: [] }, ...p];
            return [...updated].sort((a, b) => (b.pinned - a.pinned) || (new Date(b.updatedAt) - new Date(a.updatedAt)));
          });
        } else if (event === 'error') {
          throw new Error(payload.message || 'Unknown error');
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMsgs(p => p.filter(m => m._id !== tempId));
      setStreamText(''); setStreaming(false);
      setError(err.message || 'Failed to send. Please try again.');
    }
  }, [input, streaming, activeId]);

  const regenerate = useCallback(() => {
    const lastUser = [...msgs].reverse().find(m => m.role === 'user');
    if (lastUser) {
      setMsgs(p => p.slice(0, -1));
      send(lastUser.content);
    }
  }, [msgs, send]);

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Voice input not supported in this browser. Try Chrome.'); return; }

    if (recording) {
      recognRef.current?.stop();
      setRecording(false);
      return;
    }

    const r = new SR();
    recognRef.current = r;
    r.lang = 'en-IN';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = e => {
      const text = e.results[0][0].transcript;
      setInput(prev => (prev + ' ' + text).trim());
    };
    r.onerror = () => setRecording(false);
    r.onend = () => setRecording(false);
    r.start();
    setRecording(true);
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const onInput = e => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const downloadChat = () => {
    if (!msgs.length) return;
    const text = msgs.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([`VakilAI - ${title}\n${'='.repeat(50)}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `VakilAI-${title.slice(0, 30)}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <Sidebar
        convs={convs} activeId={activeId}
        onSelect={selectConv} onNew={newChat}
        onDelete={deleteConv} onPin={pinConv} onClearAll={clearAll}
        open={sbOpen} onClose={() => setSbOpen(false)}
      />

      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <button className="btn-ham" onClick={() => setSbOpen(true)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="topbar-left">
            <div className="topbar-brand-icon">⚖️</div>
            <div className="topbar-text">
              <span className="topbar-name">VakilAI</span>
              <span className="topbar-title-small">{title}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-actions">
              <button className="topbar-btn" onClick={() => setShowTemplates(true)} title="Legal Templates">📋 Templates</button>
              <button className="topbar-btn" onClick={() => setShowEmergency(true)} title="Emergency Contacts">🆘 Emergency</button>
              {msgs.length > 0 && (
                <button className="topbar-btn" onClick={downloadChat} title="Download this chat">↓ Save</button>
              )}
            </div>
            <div className={`topbar-status ${streaming ? 'thinking' : ''}`}>
              <span className="status-dot" />
              <span>{streaming ? 'Thinking…' : 'Online'}</span>
            </div>
            <span className="topbar-badge">⚖ Indian Law</span>
          </div>
        </div>

        {/* Messages */}
        <div className="msgs">
          {msgs.length === 0 && !streaming
            ? <WelcomeScreen onTopic={q => send(q)} />
            : <>
                {msgs.map((m, i) => (
                  <Message
                    key={m._id || m.timestamp}
                    msg={m}
                    onRegenerate={!streaming && m.role === 'assistant' && i === msgs.length - 1 ? regenerate : null}
                  />
                ))}
                {streaming && streamText && (
                  <div className="msg assistant">
                    <div className="av" style={{ background: 'linear-gradient(145deg,var(--ink-700),var(--ink-600))', border: '1px solid var(--border-2)', fontSize: '1rem' }}>⚖️</div>
                    <div className="bubble-wrap">
                      <div className="bubble-meta">
                        <span className="bubble-name" style={{ color: 'var(--gold-300)' }}>VakilAI</span>
                      </div>
                      <div className="bubble stream-bubble">
                        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{streamText}</span>
                        <span className="stream-cursor" />
                      </div>
                    </div>
                  </div>
                )}
                {streaming && !streamText && <Typing />}
              </>
          }
          {error && (
            <div className="toast">
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <pre>{error}</pre>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="inputbar">
          <div className={`input-wrap ${streaming ? 'input-wrap--busy' : ''}`}>
            <div className="input-prefix">⚖️</div>
            <textarea
              ref={taRef} className="chat-input"
              placeholder="Ask a legal question… e.g. 'My employer didn't pay salary for 2 months'"
              value={input} onChange={onInput} onKeyDown={onKey} rows={1} disabled={streaming}
            />
            <div className="input-actions">
              <button
                className={`btn-voice ${recording ? 'recording' : ''}`}
                onClick={toggleVoice}
                title={recording ? 'Stop recording' : 'Voice input'}
              >
                {recording ? '⏹' : '🎤'}
              </button>
              <button className="btn-send" onClick={() => send()} disabled={!input.trim() || streaming} aria-label="Send">
                {streaming
                  ? <span className="spinner" style={{ width: 14, height: 14 }} />
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                }
              </button>
            </div>
          </div>
          <div className="input-footer">
            <p className="hint">⚖ General legal information · Not professional advice · <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for newline</p>
            {input.length > 0 && <span className="char-count">{input.length}</span>}
          </div>
        </div>
      </div>

      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} onSelect={q => { send(q); setShowTemplates(false); }} />}
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
    </div>
  );
}
