import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';

const Dashboard = () => {
    const [balance, setBalance] = useState(0);
    const [walletId, setWalletId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState({ aiCoach: {}, health: {}, projection: {} });
    const [cards, setCards] = useState([]);
    const [user, setUser] = useState({});
    const [showQR, setShowQR] = useState(false);
    const [showBalance, setShowBalance] = useState(true);
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const storedUserString = localStorage.getItem('user');
        if (!storedUserString) return;
        const storedUser = JSON.parse(storedUserString);
        setUser(storedUser);
        fetchData();

        const socket = io('http://localhost:5000');
        socket.on('connect', () => socket.emit('join_room', storedUser.id));
        socket.on('PAYMENT_RECEIVED', () => fetchData()); 

        return () => {
            socket.off('connect');
            socket.off('PAYMENT_RECEIVED');
            socket.disconnect();
        };
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, txnRes, analyticsRes, cardsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/wallet', config),
                axios.get('http://localhost:5000/api/transactions', config),
                axios.get('http://localhost:5000/api/analytics/insights', config),
                axios.get('http://localhost:5000/api/wallet/cards', config)
            ]);
            
            setBalance(walletRes.data.balance);
            setWalletId(walletRes.data.wallet_id);
            setTransactions(txnRes.data.slice(0, 5));
            setAnalytics(analyticsRes.data);
            setCards(cardsRes.data);
        } catch (err) { console.error(err); }
    };

    const primaryCard = cards.find(c => c.is_primary) || cards[0];

    return (
        <div className="adaptive-grid">
            {/* Left Column: Wallet & Quick Actions */}
            <div style={{ gridColumn: 'span 1' }}>
                <header style={{ marginBottom: '30px' }}>
                    <small style={{ color: 'var(--text-muted)' }}>Welcome back,</small>
                    <h1>{user.name}</h1>
                </header>

                <div className="card" style={{ 
                    background: 'linear-gradient(135deg, var(--primary), #8e78ff)', 
                    color: 'white',
                    marginBottom: '30px',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
                }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '13px', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Unified Wallet Balance</p>
                            <button 
                                onClick={() => setShowBalance(!showBalance)} 
                                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', padding: '5px', borderRadius: '50%', width: '32px', height: '32px' }}
                                title={showBalance ? "Hide Balance" : "Show Balance"}
                            >
                                {showBalance ? '👁️' : '🙈'}
                            </button>
                        </div>
                        <h1 style={{ fontSize: '42px', margin: '15px 0' }}>
                            {showBalance 
                                ? `$${parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                                : '$ ••••'}
                        </h1>
                    </div>
                    
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        padding: '12px 15px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div>
                            <small style={{ display: 'block', fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', marginBottom: '2px' }}>Default Source</small>
                            {primaryCard ? (
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                                    {primaryCard.brand} •••• {primaryCard.last4}
                                </p>
                            ) : (
                                <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>No source linked</p>
                            )}
                        </div>
                        <button 
                            onClick={() => navigate('/cards')}
                            style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                        >
                            MANAGE
                        </button>
                    </div>
                </div>

                <div className="adaptive-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/send')}>
                        <span>📤 Send</span>
                    </button>
                    <button className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/request')}>
                        <span>📥 Request</span>
                    </button>
                    <button className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/withdraw')}>
                        <span>📤 Withdraw</span>
                    </button>
                    <button className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/add-money')}>
                        <span>💳 Add</span>
                    </button>
                    <button className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/bills')}>
                        <span>📄 Bills</span>
                    </button>
                    <button className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => navigate('/transfer-to-card')}>
                        <span>🔄 To Card</span>
                    </button>
                </div>

                {showQR && (
                    <div className="card" style={{ textAlign: 'center', marginTop: '30px' }}>
                        <h3>My Wallet QR</h3>
                        <div style={{ padding: '20px', background: 'white', borderRadius: '20px', display: 'inline-block', margin: '20px 0' }}>
                            <QRCodeSVG value={`pay:${user.email}`} size={160} />
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan this code to pay me</p>
                        <button className="btn" onClick={() => setShowQR(false)} style={{ width: '100%', marginTop: '10px' }}>Close</button>
                    </div>
                )}
            </div>

            {/* Middle Column: Activity & Insights */}
            <div style={{ gridColumn: 'span 1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Recent Activity</h2>
                    {transactions.length > 0 && (
                        <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700' }}>See all</button>
                    )}
                </div>

                <div className="card" style={{ padding: '10px 20px' }}>
                    {transactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>💸</div>
                            <h4 style={{ margin: '0 0 10px 0' }}>No transactions yet</h4>
                            {cards.length === 0 && (
                                <>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Ready to fund your wallet? Link a card to get started.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/cards/add')} style={{ fontSize: '13px', minHeight: '40px' }}>Link Your First Card</button>
                                </>
                            )}
                        </div>
                    ) : (
                        transactions.map(txn => {
                            const isSender = txn.sender_wallet_id === walletId;
                            return (
                                <div key={txn.transaction_id} className="txn-item" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <div className="txn-icon" style={{ 
                                        background: isSender ? '#fee2e2' : '#dcfce7',
                                        color: isSender ? '#ef4444' : '#22c55e'
                                    }}>
                                        {isSender ? '↗️' : '↙️'}
                                    </div>
                                    <div className="txn-info">
                                        <div style={{ fontWeight: '700' }}>{isSender ? 'Sent to' : 'From'} {txn.other_party_email}</div>
                                        <small style={{ color: 'var(--text-muted)' }}>{new Date(txn.timestamp).toLocaleDateString()}</small>
                                    </div>
                                    <div className="txn-amount" style={{ color: isSender ? 'var(--text-main)' : 'var(--secondary)' }}>
                                        {isSender ? '-' : '+'}{showBalance ? `$${parseFloat(txn.amount).toFixed(2)}` : '$ ••••'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Column: AI & Promotion */}
            <div style={{ gridColumn: 'span 1' }}>
                <div className="card" style={{ background: 'var(--primary-light)', border: 'none', marginBottom: '20px', cursor: 'pointer' }} onClick={() => navigate('/insights')}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>🤖 AI Smart Insights</h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{analytics?.aiCoach?.message || 'Analyzing your spending patterns...'}</p>
                </div>

                <div className="card" style={{ background: 'var(--bg-app)', border: '1px dashed var(--border)' }}>
                    <h3>✨ System Status</h3>
                    <p style={{ fontSize: '13px', margin: '10px 0', color: 'var(--text-muted)' }}>All systems operational. Your account is secured with 256-bit encryption.</p>
                    <button className="btn" onClick={() => navigate('/security')} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%' }}>View Security</button>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
