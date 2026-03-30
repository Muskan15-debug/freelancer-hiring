import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-600)', lineHeight: 1 }}>404</h1>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Page Not Found</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>The page you're looking for doesn't exist or has been moved.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  );
};

export default NotFound;
