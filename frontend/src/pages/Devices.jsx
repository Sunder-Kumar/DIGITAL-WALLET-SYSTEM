import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Devices = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Mock devices for demonstration
    const [devices, setDevices] = useState([
        { id: 1, name: 'iPhone 14 Pro (Current)', location: 'Karachi, Pakistan', lastActive: 'Active Now', isCurrent: true, icon: '📱' },
        { id: 2, name: 'Windows PC - Chrome', location: 'Lahore, Pakistan', lastActive: '2 hours ago', isCurrent: false, icon: '💻' },
        { id: 3, name: 'MacBook Air - Safari', location: 'Islamabad, Pakistan', lastActive: 'Yesterday', isCurrent: false, icon: '💻' }
    ]);

    const handleLogoutOther = () => {
        if (!window.confirm("Logout from all other devices?")) return;
        setLoading(true);
        setTimeout(() => {
            setDevices(devices.filter(d => d.isCurrent));
            setLoading(false);
            toast.success("Logged out from other devices successfully");
        }, 1500);
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: 'var(--text-main)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Active Sessions</h3>
            </div>

            <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '24px' }}>🛡️</div>
                    <h4 style={{ margin: 0 }}>Device Management</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Review all devices where your SecureWallet account is currently logged in. If you don't recognize a device, terminate the session immediately.
                </p>
            </div>

            <h4 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>CURRENT DEVICE</h4>
            {devices.filter(d => d.isCurrent).map(device => (
                <div key={device.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', border: '2px solid var(--primary-light)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{device.icon}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '15px' }}>{device.name}</div>
                        <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '800' }}>{device.lastActive}</div>
                    </div>
                </div>
            ))}

            <h4 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>OTHER DEVICES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                {devices.filter(d => !d.isCurrent).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>No other active sessions</div>
                ) : (
                    devices.filter(d => !d.isCurrent).map(device => (
                        <div key={device.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{device.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{device.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{device.location} • {device.lastActive}</div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Terminate</button>
                        </div>
                    ))
                )}
            </div>

            {devices.length > 1 && (
                <button 
                    className="btn" 
                    onClick={handleLogoutOther}
                    disabled={loading}
                    style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: '800', borderRadius: '15px' }}
                >
                    {loading ? 'Processing...' : 'Logout from all other devices'}
                </button>
            )}
        </div>
    );
};

export default Devices;
