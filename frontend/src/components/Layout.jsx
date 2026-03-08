import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const notifRef = useRef(null);
  const searchRef = useRef(null);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click Outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();

    const socket = io('http://localhost:5000');
    socket.emit('join_room', storedUser.id);

    socket.on('NOTIFICATION_RECEIVED', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) { console.error("Failed to fetch notifications"); }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
    } catch (err) { alert("Failed to clear notifications"); }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      setIsSearching(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/users/search?query=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(res.data);
      } catch (err) { console.error(err); }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

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

  const mobileNavLinks = [
    { path: '/dashboard', icon: '🏠' },
    { path: '/transactions', icon: '📊' },
    { path: '/contacts', icon: '👥' },
    { path: '/insights', icon: '💡' }
  ];

  return (
    <div className="app-shell">
      {/* Mobile Top Header (Fintech Style) */}
      <header className="mobile-header">
        <div 
          onClick={() => navigate('/profile')} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8e78ff)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', fontWeight: '800' }}
        >
          {storedUser.name?.charAt(0).toUpperCase()}
        </div>
        
        <div className="search-container" ref={searchRef} style={{ flex: 1, margin: '0 12px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Find people and merchant" 
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: '100%', height: '40px', borderRadius: '20px', border: 'none', background: 'var(--bg-input)', padding: '0 15px 0 35px', fontSize: '13px', color: 'var(--text-main)' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          
          {/* Search Results Dropdown */}
          {isSearching && searchQuery.length > 1 && (
            <div style={{ position: 'absolute', top: '50px', left: 0, right: 0, background: 'var(--bg-card)', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 2000, padding: '10px', border: '1px solid var(--border)' }}>
              {searchResults.length === 0 ? (
                <p style={{ padding: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>No users found</p>
              ) : (
                searchResults.map(user => (
                  <div 
                    key={user.user_id} 
                    onClick={() => { navigate(`/send?email=${user.email}`); setSearchQuery(''); setIsSearching(false); }}
                    style={{ padding: '10px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span onClick={() => navigate('/scan')} style={{ fontSize: '22px', cursor: 'pointer' }}>📷</span>
          <span onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }} style={{ fontSize: '22px', cursor: 'pointer', position: 'relative' }}>
            🔔
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-card)' }}></span>
            )}
          </span>
        </div>
      </header>

      {/* Notification Drawer */}
      {showNotifications && (
        <div ref={notifRef} style={{ position: 'fixed', top: '75px', right: '20px', width: '300px', maxHeight: '400px', background: 'var(--bg-card)', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', zIndex: 1003, overflowY: 'auto', border: '1px solid var(--border)', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            <button onClick={handleClearNotifications} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Clear All</button>
          </div>
          {notifications.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>No new notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.notification_id || n.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: n.type === 'security' ? 'var(--danger)' : 'var(--text-main)' }}>{n.title}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : n.time}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}

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
        {mobileNavLinks.map(link => (
          <Link key={link.path} to={link.path} className={`nav-item ${isActive(link.path)}`} style={{ padding: '10px 0' }}>
            <span className="nav-icon" style={{ fontSize: '28px' }}>{link.icon}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
