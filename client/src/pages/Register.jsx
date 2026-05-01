import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form,  setForm]  = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);
  const { register }      = useAuth();
  const nav               = useNavigate();

  const set = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError('Please fill in all fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    try { await register(form.name, form.email, form.password); nav('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed. Please try again.'); }
    finally { setBusy(false); }
  };

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
            Legal guidance<br />
            <span className="auth-hero-accent">for every Indian</span>
          </div>
          <p className="auth-hero-desc">
            Join thousands of citizens getting clear, specific, and actionable answers to their legal questions — in plain language.
          </p>
          <div className="auth-features">
            {[
              ['⚖️', 'Expert Indian Law', 'IPC, CrPC, Consumer, Family, Property & more'],
              ['📚', 'Exact Legal Citations', 'Every answer cites the specific section and act'],
              ['🚀', 'Instant Answers', 'Real-time streaming responses — no waiting'],
              ['🔒', 'Private & Secure', 'Your consultations are encrypted and confidential'],
            ].map(([ico, title, desc]) => (
              <div className="auth-feature" key={title}>
                <div className="auth-feature-ico">{ico}</div>
                <div>
                  <div className="auth-feature-title">{title}</div>
                  <div className="auth-feature-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="auth-left-bg" aria-hidden="true">
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-grid-overlay" />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-brand">
            <div className="auth-brand-icon">⚖️</div>
            <div>
              <h1>VakilAI</h1>
              <span>Indian Legal Intelligence</span>
            </div>
          </div>

          <h2 className="auth-heading">Create account</h2>
          <p className="auth-sub">Free access to Indian legal guidance</p>

          <form className="auth-form" onSubmit={submit}>
            {error && <div className="err-box"><span>⚠️</span><span>{error}</span></div>}

            <div className="field">
              <label htmlFor="name">Full Name</label>
              <div className="field-wrap">
                <span className="field-ico">👤</span>
                <input id="name" name="name" type="text" placeholder="Rahul Sharma"
                  value={form.name} onChange={set} autoComplete="name" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <div className="field-wrap">
                <span className="field-ico">✉</span>
                <input id="email" name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={set} autoComplete="email" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password <span style={{color:'var(--text-700)',fontWeight:400}}>(min 6 chars)</span></label>
              <div className="field-wrap">
                <span className="field-ico">🔒</span>
                <input id="password" name="password" type="password" placeholder="At least 6 characters"
                  value={form.password} onChange={set} autoComplete="new-password" required minLength={6} />
              </div>
            </div>

            <button className="btn-gold" type="submit" disabled={busy}>
              {busy ? <><span className="spinner" style={{ width:15,height:15 }} /> Creating account…</> : <>Create Account <span className="btn-arrow">→</span></>}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
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
