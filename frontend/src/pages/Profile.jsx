import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    useEffect(() => {
        setUser(storedUser);
        setEditName(storedUser.name || '');
        setEditEmail(storedUser.email || '');
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to sign out?");
        if (confirmLogout) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            window.location.reload();
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.put(`${API_URL}/api/profile`, 
                { name: editName, email: editEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state and localStorage
            const updatedUser = { ...storedUser, name: editName, email: editEmail };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '40px' }}>Settings</h3>
            
            {/* User Profile Info Card */}
            <div 
                onClick={() => setIsEditing(true)}
                style={{ textAlign: 'center', marginBottom: '40px', cursor: 'pointer', position: 'relative' }}
            >
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
                    <div style={{ position: 'absolute', bottom: '50px', right: 'calc(50% - 45px)', background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', border: '3px solid var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✏️</div>
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

            {/* Profile Edit Drawer */}
            {isEditing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ background: 'var(--bg-card)', width: '100%', borderRadius: '30px 30px 0 0', padding: '30px', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ width: '40px', height: '5px', background: 'var(--border)', borderRadius: '10px', margin: '0 auto 20px auto' }}></div>
                        <h3 style={{ marginBottom: '20px', fontWeight: '800' }}>Edit Profile</h3>
                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ background: 'var(--bg-input)', border: 'none', borderRadius: '15px', height: '50px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    style={{ background: 'var(--bg-input)', border: 'none', borderRadius: '15px', height: '50px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    className="btn" 
                                    style={{ flex: 1, background: 'var(--bg-input)', color: 'var(--text-main)', borderRadius: '15px', height: '50px', fontWeight: '800' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn btn-primary" 
                                    style={{ flex: 1, borderRadius: '15px', height: '50px', fontWeight: '800' }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Utility & Deep Services */}
            <h4 style={{ margin: '0 0 15px 10px', fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Utilities</h4>
            <div className="card" style={{ padding: '8px 24px', marginBottom: '30px' }}>
                <div 
                    onClick={() => navigate('/topup')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>📱</span>
                        <span style={{ fontWeight: '600' }}>Mobile Top-up</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                </div>
                
                <div 
                    onClick={() => navigate('/bills')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <span style={{ fontWeight: '600' }}>Utility Bills</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                </div>
            </div>

            {/* Account & Security */}
            <h4 style={{ margin: '0 0 15px 10px', fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security & Management</h4>
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
                    onClick={() => navigate('/devices')}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>🛡️</span>
                        <span style={{ fontWeight: '600' }}>Active Sessions</span>
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

