const TEMPLATES = [
  {
    ico: '📋', name: 'Legal Notice',
    desc: 'Draft a formal legal notice for non-payment, property dispute, etc.',
    q: 'Help me draft a legal notice for non-payment of dues of ₹50,000 by my client',
  },
  {
    ico: '🏠', name: 'Rent Agreement Query',
    desc: 'Understand rent agreement clauses and tenant rights',
    q: 'What are the essential clauses that should be in a rental agreement in India?',
  },
  {
    ico: '💼', name: 'Salary Non-Payment',
    desc: 'Steps when employer refuses to pay salary',
    q: 'My employer has not paid salary for 3 months. What legal action can I take under Payment of Wages Act?',
  },
  {
    ico: '🛡️', name: 'Consumer Complaint',
    desc: 'How to file consumer forum complaint',
    q: 'How do I file a complaint in the consumer forum for a defective product worth ₹15,000?',
  },
  {
    ico: '🔒', name: 'Cyber Fraud',
    desc: 'Steps to take after online fraud',
    q: 'I lost ₹1,00,000 in an online UPI fraud. What are my legal options under IT Act 2000?',
  },
  {
    ico: '👨‍👩‍👧', name: 'Divorce Process',
    desc: 'Understand divorce procedures in India',
    q: 'What is the complete process for mutual consent divorce under Hindu Marriage Act? How long does it take?',
  },
  {
    ico: '📄', name: 'RTI Application',
    desc: 'How to file RTI application',
    q: 'Guide me step by step on how to file an RTI application. What information can I request?',
  },
  {
    ico: '🏛️', name: 'Bail Application',
    desc: 'Understanding bail rights and process',
    q: 'What is the process for getting anticipatory bail in India? Under which sections can I apply?',
  },
  {
    ico: '💰', name: 'Property Dispute',
    desc: 'Resolve property and land disputes',
    q: 'My neighbour has encroached on my land. What legal steps can I take under Transfer of Property Act?',
  },
];

export default function TemplatesModal({ onClose, onSelect }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📋 Legal Templates</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Quick-start with common legal queries. Click any template to begin.
        </p>
        <div className="template-grid">
          {TEMPLATES.map(t => (
            <div key={t.name} className="template-item" onClick={() => { onSelect(t.q); onClose(); }}>
              <div className="template-ico">{t.ico}</div>
              <div>
                <div className="template-name">{t.name}</div>
                <div className="template-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
