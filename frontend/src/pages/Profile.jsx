import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
    }, []);

    const handleLogout = () => {
        // Smooth transition simulation
        const confirmLogout = window.confirm("Are you sure you want to sign out?");
        if (confirmLogout) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            window.location.reload();
        }
    };

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '40px' }}>Settings</h3>
            
            {/* User Profile Info Card */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '30px', 
                    background: 'linear-gradient(135deg, var(--primary), #8e78ff)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '36px',
                    margin: '0 auto 20px auto',
                    fontWeight: '800',
                    boxShadow: '0 15px 30px rgba(93, 63, 211, 0.2)'
                }}>
                    {user.name?.charAt(0)}
                </div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{user.name}</h2>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0', fontSize: '14px' }}>{user.email}</p>
                <span style={{ 
                    background: 'var(--primary-light)', 
                    color: 'var(--primary)', 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '800',
                    display: 'inline-block',
                    marginTop: '10px'
                }}>
                    {user.role === 'admin' ? '🛡️ Administrator' : '✅ Verified Account'}
                </span>
            </div>

            {/* Menu Sections */}
            <div className="card" style={{ padding: '8px 24px', marginBottom: '30px' }}>
                <div 
                    onClick={() => navigate('/kyc')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>👤</span>
                        <span style={{ fontWeight: '600' }}>Identity Verification</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{user.kyc_status === 'verified' ? '✅' : '›'}</span>
                </div>
                
                <div 
                    onClick={() => navigate('/security')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>🛡️</span>
                        <span style={{ fontWeight: '600' }}>Security & 2FA</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                </div>

                <div 
                    onClick={() => navigate('/cards')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>💳</span>
                        <span style={{ fontWeight: '600' }}>Payment Methods</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                </div>

                <div 
                    onClick={() => navigate('/statements')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>📊</span>
                        <span style={{ fontWeight: '600' }}>Monthly Statements</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                </div>

                {user.role === 'admin' && (
                    <div 
                        onClick={() => navigate('/admin')}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '20px' }}>🛠️</span>
                            <span style={{ fontWeight: '600' }}>Admin Panel</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                    </div>
                )}

                <div 
                    onClick={() => navigate('/legal')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <span style={{ fontWeight: '600' }}>Legal & Privacy</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                </div>
            </div>

            {/* Premium Logout Section */}
            <div style={{ padding: '0 8px' }}>
                <button 
                    onClick={handleLogout} 
                    className="btn" 
                    style={{ 
                        width: '100%', 
                        height: '56px', 
                        background: 'rgba(255, 61, 0, 0.08)', 
                        color: 'var(--danger)', 
                        border: 'none',
                        borderRadius: '18px',
                        fontWeight: '800',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <span>🚪</span> Sign Out
                </button>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '40px', fontWeight: '600' }}>
                SECUREWALLET V3.0.4 (ENTERPRISE)
            </p>
        </div>
    );
};

export default Profile;

