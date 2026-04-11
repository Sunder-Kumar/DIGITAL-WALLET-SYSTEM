import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'kyc'
    const [stats, setStats] = useState({ users: 0, transactions: 0, flagged: 0 });
    const [flaggedTxns, setFlaggedTxns] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();

        // Pillar 3: Real-time Admin Monitoring
        const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '');
        socket.emit('join_admin_monitor');

        socket.on('NEW_FRAUD_ALERT', (alert) => {
            toast.error(`⚠️ CRITICAL: Fraud Alert #${alert.transaction_id} detected!`, {
                duration: 6000,
                position: 'top-right',
                style: { background: '#ff3d00', color: '#fff', fontWeight: 'bold' }
            });
            fetchData(); // Refresh stats and list
        });

        return () => socket.disconnect();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, flaggedRes, usersRes] = await Promise.all([
                axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/stats', config),
                axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/flagged', config),
                axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/users', config)
            ]);
            setStats(statsRes.data);
            setFlaggedTxns(flaggedRes.data);
            setUsers(usersRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleKYC = async (userId, status) => {
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/kyc/update', { userId, status }, config);
            fetchData();
            toast.success(`User ${status === 'verified' ? 'Approved' : 'Rejected'}`);
        } catch (err) { alert("Action failed"); }
    };

    // Visualization Data
    const fraudData = [
        { name: 'Legit', value: stats.transactions - stats.flagged },
        { name: 'Suspicious', value: stats.flagged },
    ];
    const COLORS = ['#00c853', '#ff3d00'];

    return (
        <div style={{ paddingBottom: '100px' }}>
            <Toaster />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Admin Command Center</h1>
                <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-input)', padding: '5px', borderRadius: '12px' }}>
                    {['overview', 'users', 'kyc'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{ 
                                padding: '8px 20px', 
                                border: 'none', 
                                borderRadius: '8px',
                                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="adaptive-grid" style={{ marginBottom: '30px' }}>
                        <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                            <small style={{ color: 'var(--text-muted)' }}>Platform Users</small>
                            <h2>{stats.users}</h2>
                        </div>
                        <div className="card" style={{ borderLeft: '5px solid var(--secondary)' }}>
                            <small style={{ color: 'var(--text-muted)' }}>Total Volume</small>
                            <h2>{stats.transactions} txns</h2>
                        </div>
                        <div className="card" style={{ borderLeft: '5px solid var(--danger)' }}>
                            <small style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Live Fraud Alerts</small>
                            <h2 style={{ color: 'var(--danger)' }}>{stats.flagged}</h2>
                        </div>
                    </div>

                    <div className="adaptive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        <div className="card">
                            <h4>Risk Distribution</h4>
                            <div style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={fraudData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {fraudData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="card">
                            <h4>Live Fraud Feed</h4>
                            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {flaggedTxns.map(t => (
                                    <div key={t.transaction_id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '13px' }}>#{t.transaction_id} | {t.sender}</div>
                                            <small style={{ color: 'var(--danger)' }}>Score: {t.fraud_score.toFixed(2)}</small>
                                        </div>
                                        <div style={{ fontWeight: '800' }}>Rs. {t.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-input)', textAlign: 'left' }}>
                                <th style={{ padding: '15px' }}>User</th>
                                <th style={{ padding: '15px' }}>Status</th>
                                <th style={{ padding: '15px' }}>Balance</th>
                                <th style={{ padding: '15px' }}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '700' }}>{u.name}</div>
                                        <small style={{ color: 'var(--text-muted)' }}>{u.email}</small>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ background: u.kyc_status === 'verified' ? '#dcfce7' : '#fef9c3', color: u.kyc_status === 'verified' ? '#166534' : '#854d0e', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                                            {u.kyc_status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: '700' }}>Rs. {parseFloat(u.balance).toFixed(2)}</td>
                                    <td style={{ padding: '15px' }}>{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'kyc' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                    {users.filter(u => u.kyc_status === 'pending').map(u => {
                        const docs = u.kyc_documents ? JSON.parse(u.kyc_documents) : {};
                        return (
                            <div key={u.user_id} className="card" style={{ padding: '25px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: `url(${docs.selfie}) center/cover, var(--primary-light)` }}></div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{u.name}</h4>
                                        <small style={{ color: 'var(--text-muted)' }}>{u.email}</small>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <small style={{ display: 'block', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px' }}>ID: {docs.id_type?.toUpperCase()} - {docs.id_number}</small>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div 
                                            onClick={() => window.open(docs.cnic_front)}
                                            style={{ height: '80px', borderRadius: '10px', background: `url(${docs.cnic_front}) center/cover`, border: '1px solid var(--border)', cursor: 'pointer' }}
                                        ></div>
                                        <div 
                                            onClick={() => window.open(docs.cnic_back)}
                                            style={{ height: '80px', borderRadius: '10px', background: `url(${docs.cnic_back}) center/cover`, border: '1px solid var(--border)', cursor: 'pointer' }}
                                        ></div>
                                    </div>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '11px', textAlign: 'center', color: 'var(--primary)', fontWeight: '700' }}>Click images to enlarge</p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn" style={{ flex: 1, background: 'var(--secondary)', color: 'white', fontSize: '12px', height: '40px' }} onClick={() => handleKYC(u.user_id, 'verified')}>Approve</button>
                                    <button className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white', fontSize: '12px', height: '40px' }} onClick={() => handleKYC(u.user_id, 'rejected')}>Reject</button>
                                </div>
                            </div>
                        );
                    })}
                    {users.filter(u => u.kyc_status === 'pending').length === 0 && (
                        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>✅</div>
                            <h3 style={{ margin: 0 }}>All caught up!</h3>
                            <p style={{ color: 'var(--text-muted)' }}>No pending identity verifications at the moment.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;

