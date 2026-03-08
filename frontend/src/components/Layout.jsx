import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  if (!token) return <div className="main-content">{children}</div>;

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/transactions', label: 'History', icon: '📊' },
    { path: '/scan', label: 'Scan', icon: '📷' },
    { path: '/insights', label: 'Insights', icon: '💡' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <h2 style={{ marginBottom: '40px', color: 'var(--primary)' }}>SecureWallet</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className={`nav-link ${isActive(link.path)}`}>
              <span style={{ fontSize: '20px' }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <button className="btn" onClick={toggleTheme} style={{ background: 'var(--bg-input)', color: 'var(--text-main)', marginTop: '20px' }}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </aside>

      {/* Main Area */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav" style={{ height: '70px' }}>
        {navLinks.map(link => (
          <Link key={link.path} to={link.path} className={`nav-item ${isActive(link.path)}`} style={{ padding: '10px 0' }}>
            <span className="nav-icon" style={{ fontSize: '28px' }}>{link.icon}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
