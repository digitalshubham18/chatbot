import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', background:'var(--bg-950)' }}>
      <span style={{ fontSize:'2.5rem' }}>⚖️</span>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}
