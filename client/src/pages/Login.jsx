import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LEGAL_FACTS = [
  { icon: '🏛️', title: 'Right to Free Legal Aid', body: 'Under Article 39A of the Constitution, every Indian citizen has the right to free legal aid if they cannot afford it.' },
  { icon: '📋', title: 'FIR is Your Right', body: 'Police must register an FIR under Section 154 CrPC. Refusing to file one is a punishable offence.' },
  { icon: '🛡️', title: 'Consumer Protection', body: 'Under Consumer Protection Act 2019, you can claim compensation up to ₹1 crore for defective products or services.' },
  { icon: '💼', title: 'Workplace Rights', body: 'POSH Act 2013 mandates every organisation with 10+ employees to have an Internal Complaints Committee.' },
  { icon: '🔒', title: 'Right to Privacy', body: 'Article 21 of the Constitution includes the Right to Privacy as a fundamental right, upheld by the Supreme Court in 2017.' },
  { icon: '🏠', title: 'Tenant Rights', body: 'A landlord cannot evict you without due legal notice and court order, regardless of verbal agreements.' },
];

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [busy,    setBusy]    = useState(false);
  const [fact,    setFact]    = useState(0);
  const [show,    setShow]    = useState(false);
  const { login }             = useAuth();
  const nav                   = useNavigate();

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => { setFact(f => (f + 1) % LEGAL_FACTS.length); setShow(true); }, 400);
    }, 5000);
    setShow(true);
    return () => clearInterval(id);
  }, []);

  const set = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    setBusy(true);
    try { await login(form.email, form.password); nav('/'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed. Check your credentials.'); }
    finally { setBusy(false); }
  };

  const f = LEGAL_FACTS[fact];

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-hero-brand">
            <div className="auth-hero-icon">⚖️</div>
            <div>
              <div className="auth-hero-name">VakilAI</div>
              <div className="auth-hero-tagline">Indian Legal Intelligence</div>
            </div>
          </div>

          <div className="auth-hero-headline">
            Your AI-powered<br />
            <span className="auth-hero-accent">Legal Advisor</span>
          </div>
          <p className="auth-hero-desc">
            Get specific, actionable legal guidance on Indian law — backed by exact legal citations and practical next steps.
          </p>

          <div className={`auth-fact-card ${show ? 'fact-show' : 'fact-hide'}`}>
            <div className="auth-fact-icon">{f.icon}</div>
            <div>
              <div className="auth-fact-title">{f.title}</div>
              <div className="auth-fact-body">{f.body}</div>
            </div>
          </div>

          <div className="auth-hero-areas">
            {['Criminal Law','Consumer Rights','Property','Family Law','Cyber Crime','Labour Law','RTI','Contracts'].map(a => (
              <span key={a} className="auth-area-tag">{a}</span>
            ))}
          </div>
        </div>

        <div className="auth-left-bg" aria-hidden="true">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-grid-overlay" />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-brand">
            <div className="auth-brand-icon">⚖️</div>
            <div>
              <h1>VakilAI</h1>
              <span>Indian Legal Intelligence</span>
            </div>
          </div>

          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-sub">Sign in to continue your legal consultations</p>

          <form className="auth-form" onSubmit={submit}>
            {error && <div className="err-box"><span>⚠️</span><span>{error}</span></div>}

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <div className="field-wrap">
                <span className="field-ico">✉</span>
                <input id="email" name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={set} autoComplete="email" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="field-wrap">
                <span className="field-ico">🔒</span>
                <input id="password" name="password" type="password" placeholder="••••••••"
                  value={form.password} onChange={set} autoComplete="current-password" required />
              </div>
            </div>

            <button className="btn-gold" type="submit" disabled={busy}>
              {busy ? <><span className="spinner" style={{ width:15,height:15 }} /> Signing in…</> : <>Sign In <span className="btn-arrow">→</span></>}
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Create one free</Link>
            </p>
          </form>

          <div className="auth-disclaimer">
            ⚖️ General legal information only — not a substitute for professional legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}
