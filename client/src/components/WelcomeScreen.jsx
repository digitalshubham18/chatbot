const TOPICS = [
  { ico:'📋', name:'FIR & Criminal',   desc:'File FIR, bail, IPC sections',           q:'How do I file an FIR at a police station in India?' },
  { ico:'🛒', name:'Consumer Rights',  desc:'Defective goods, refunds, court',         q:'How do I file a consumer complaint against a company?' },
  { ico:'🏠', name:'Property Law',     desc:'Buying, renting, landlord disputes',      q:'My landlord is refusing to return my security deposit. What can I do?' },
  { ico:'👨‍👩‍👧', name:'Family Law',  desc:'Divorce, maintenance, custody',          q:'What is the process for mutual consent divorce in India?' },
  { ico:'💻', name:'Cyber Crime',      desc:'Online fraud, IT Act, scams',             q:'I am a victim of online fraud. What should I do under IT Act?' },
  { ico:'💼', name:'Employment',       desc:'Salary disputes, termination, PF',        q:'My employer has not paid my salary for 2 months. What are my legal options?' },
  { ico:'📝', name:'Contracts',        desc:'Agreements, breach, validity',            q:'What makes a contract legally valid in India?' },
  { ico:'📄', name:'RTI',              desc:'Right to Information filing',             q:'How do I file an RTI application and what is the procedure?' },
];

export default function WelcomeScreen({ onTopic }) {
  return (
    <div className="welcome">
      <div className="welcome-emblem">
        <div className="welcome-emblem-outer">
          <span className="welcome-ico">⚖️</span>
        </div>
      </div>

      <div className="welcome-rule">
        <div className="welcome-rule-line" />
        <div className="welcome-rule-diamond" />
        <div className="welcome-rule-line" />
      </div>

      <div className="welcome-subtitle">Indian Legal Intelligence</div>
      <h1 className="welcome-title">VakilAI</h1>
      <p className="welcome-desc">
        Ask anything about Indian law — get specific, structured, and actionable legal guidance with exact legal citations. Or choose a topic below.
      </p>

      <div className="topic-grid">
        {TOPICS.map(t => (
          <button key={t.name} className="topic-btn" onClick={() => onTopic(t.q)} title={t.q}>
            <span className="topic-ico">{t.ico}</span>
            <div className="topic-name">{t.name}</div>
            <div className="topic-desc">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="welcome-footer">
        <div className="wf-diamond" />
        <span>General legal information only — not professional legal advice</span>
        <div className="wf-diamond" />
      </div>
    </div>
  );
}
