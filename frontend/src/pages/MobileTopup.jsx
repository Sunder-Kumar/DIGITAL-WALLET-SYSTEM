import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MobileTopup = () => {
    const navigate = useNavigate();
    const [network, setNetwork] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);

    const networks = [
        { id: 'jazz', name: 'Jazz', color: '#ff0000', icon: '🔴' },
        { id: 'telenor', name: 'Telenor', color: '#00adef', icon: '🔵' },
        { id: 'zong', name: 'Zong', color: '#8cc63f', icon: '🟢' },
        { id: 'ufone', name: 'Ufone', color: '#f7941d', icon: '🟠' }
    ];

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/wallet', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(res.data.balance);
        } catch (err) { console.error(err); }
    };

    const handleTopup = async (e) => {
        e.preventDefault();
        if (!network || phoneNumber.length < 10 || !amount) {
            return toast.error("Please fill all details correctly");
        }

        setLoading(true);
        try {
            // Simulated transaction for deep utilities
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/transaction/send', {
                receiver_email: `topup@${network}.pk`,
                amount: parseFloat(amount),
                category: 'Internet / Mobile Recharge',
                note: `Mobile Load for ${phoneNumber}`,
                pin: '1234' // Placeholder PIN for mock
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Rs. ${amount} Loaded to ${phoneNumber} successfully!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || "Top-up failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: 'var(--text-main)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Mobile Top-up</h3>
            </div>

            <div className="card" style={{ marginBottom: '25px', padding: '20px', background: 'linear-gradient(135deg, var(--primary), #8e78ff)', color: 'white', border: 'none' }}>
                <small style={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: '700', fontSize: '10px' }}>Available Balance</small>
                <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '900' }}>Rs. {parseFloat(balance).toLocaleString()}</h2>
            </div>

            <form onSubmit={handleTopup}>
                <h4 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>SELECT NETWORK</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '30px' }}>
                    {networks.map(net => (
                        <div 
                            key={net.id} 
                            onClick={() => setNetwork(net.id)}
                            style={{ 
                                textAlign: 'center', 
                                cursor: 'pointer',
                                padding: '15px 5px',
                                borderRadius: '16px',
                                background: network === net.id ? 'var(--primary-light)' : 'var(--bg-card)',
                                border: network === net.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                transition: '0.2s'
                            }}
                        >
                            <div style={{ fontSize: '24px', marginBottom: '5px' }}>{net.icon}</div>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: network === net.id ? 'var(--primary)' : 'var(--text-main)' }}>{net.name}</div>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Mobile Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', padding: '12px 15px', borderRadius: '12px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>+92</span>
                        <input 
                            type="tel" 
                            placeholder="300 1234567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}
                        />
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Amount (PKR)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', padding: '12px 15px', borderRadius: '12px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Rs.</span>
                        <input 
                            type="number" 
                            placeholder="Min. 100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                        {[100, 200, 500, 1000].map(amt => (
                            <button 
                                key={amt}
                                type="button"
                                onClick={() => setAmount(amt.toString())}
                                style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading || !network || phoneNumber.length < 10 || !amount}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '16px', fontWeight: '800' }}
                >
                    {loading ? 'Processing...' : 'Pay Instantly'}
                </button>
            </form>
        </div>
    );
};

export default MobileTopup;
