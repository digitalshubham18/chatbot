import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const initials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const dateLabel = (iso) => {
  try {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return d.toLocaleDateString('en-IN', { weekday: 'long' });
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return ''; }
};

export default function Sidebar({ convs, activeId, onSelect, onNew, onDelete, onPin, onClearAll, open, onClose }) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = convs.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinned   = filtered.filter(c => c.pinned);
  const unpinned = filtered.filter(c => !c.pinned);

  const groups = unpinned.reduce((acc, c) => {
    const lbl = dateLabel(c.updatedAt || c.createdAt);
    (acc[lbl] = acc[lbl] || []).push(c);
    return acc;
  }, {});

  const ConvItem = ({ c }) => (
    <div
      className={`conv ${activeId === c._id ? 'active' : ''}`}
      onClick={() => { onSelect(c._id); onClose(); }}
    >
      <div className="conv-ico-wrap">💬</div>
      <div className="conv-body">
        <div className="conv-name">{c.title}</div>
        <div className="conv-meta">
          {c.pinned && <span className="pinned-badge">📌 Pinned</span>}
          {!c.pinned && <>{c.messages?.length || 0} msg{c.messages?.length !== 1 ? 's' : ''}</>}
        </div>
      </div>
      <div className="conv-actions">
        <button
          className={`conv-btn ${c.pinned ? 'pin-active' : ''}`}
          title={c.pinned ? 'Unpin' : 'Pin'}
          onClick={e => { e.stopPropagation(); onPin(c._id); }}
        >📌</button>
        <button
          className="conv-btn"
          title="Delete"
          onClick={e => { e.stopPropagation(); onDelete(c._id); }}
        >🗑</button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sb-top">
          <div className="sb-brand">
            <div className="sb-brand-icon">⚖️</div>
            <div>
              <div className="sb-brand-name">VakilAI</div>
              <span className="sb-brand-sub">Legal Intelligence</span>
            </div>
          </div>
          <button className="sb-new" onClick={() => { onNew(); onClose(); }}>
            <span className="sb-new-plus">＋</span>
            New Consultation
          </button>
        </div>

        <div className="sb-rule" />

        <div className="sb-search">
          <span className="sb-search-ico">🔍</span>
          <input
            placeholder="Search consultations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="sb-list">
          {convs.length === 0 ? (
            <div className="sb-empty">
              <span className="sb-empty-ico">⚖️</span>
              No consultations yet.<br />Start a new one above.
            </div>
          ) : filtered.length === 0 ? (
            <div className="sb-empty">
              <span className="sb-empty-ico">🔍</span>
              No results for "{search}"
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <div>
                  <div className="sb-section"><div className="sb-label">📌 Pinned</div></div>
                  {pinned.map(c => <ConvItem key={c._id} c={c} />)}
                </div>
              )}
              {Object.entries(groups).map(([label, list]) => (
                <div key={label}>
                  <div className="sb-section"><div className="sb-label">{label}</div></div>
                  {list.map(c => <ConvItem key={c._id} c={c} />)}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="sb-foot">
          {convs.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {showConfirm ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', flex: 1 }}>Clear all?</span>
                  <button className="conv-btn" style={{ color: '#f87171' }} onClick={() => { onClearAll(); setShowConfirm(false); }}>Yes</button>
                  <button className="conv-btn" onClick={() => setShowConfirm(false)}>No</button>
                </div>
              ) : (
                <button
                  className="conv-btn"
                  style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '.75rem' }}
                  onClick={() => setShowConfirm(true)}
                >🗑 Clear all history</button>
              )}
            </div>
          )}
          <div className="user-row">
            <div className="user-av">{initials(user?.name)}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">Client</div>
            </div>
            <button className="btn-out" title="Sign out" onClick={logout}>↩</button>
          </div>
        </div>
      </aside>
    </>
  );
}
