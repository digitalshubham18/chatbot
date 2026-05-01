const CONTACTS = [
  { ico: '🚔', name: 'Police Emergency',      num: '100',  type: 'num' },
  { ico: '🚑', name: 'Ambulance',             num: '108',  type: 'num' },
  { ico: '🔥', name: 'Fire Brigade',          num: '101',  type: 'num' },
  { ico: '👩', name: 'Women Helpline',        num: '181',  type: 'num' },
  { ico: '🧒', name: 'Child Helpline',        num: '1098', type: 'num' },
  { ico: '⚖️', name: 'NALSA Legal Aid',       num: '15100', type: 'num' },
  { ico: '💻', name: 'Cyber Crime Helpline',  num: '1930', type: 'num' },
  { ico: '🛒', name: 'Consumer Helpline',     num: '1915', type: 'num' },
  { ico: '🌐', name: 'Cyber Crime Portal',    num: 'cybercrime.gov.in', type: 'link', href: 'https://cybercrime.gov.in' },
  { ico: '🏛️', name: 'NALSA Website',        num: 'nalsa.gov.in', type: 'link', href: 'https://nalsa.gov.in' },
  { ico: '📱', name: 'National Emergency',    num: '112', type: 'num' },
  { ico: '🏥', name: 'Senior Citizen Help',  num: '14567', type: 'num' },
];

export default function EmergencyModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">🆘 Emergency Contacts</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Important Indian legal helplines and emergency numbers.
        </p>
        <div className="emergency-grid">
          {CONTACTS.map(c => (
            <div key={c.name} className="emergency-item">
              <div className="emergency-ico">{c.ico}</div>
              <div className="emergency-name">{c.name}</div>
              {c.type === 'num'
                ? <a className="emergency-num" href={`tel:${c.num}`}>{c.num}</a>
                : <a className="emergency-link" href={c.href} target="_blank" rel="noreferrer">{c.num} ↗</a>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
