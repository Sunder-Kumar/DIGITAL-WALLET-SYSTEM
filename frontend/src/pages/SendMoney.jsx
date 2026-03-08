import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const SendMoney = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [receiverEmail, setReceiverEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); 
    
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchBalance();
        
        // Pillar 3: Auto-populate from Scanner (URL Params)
        const params = new URLSearchParams(location.search);
        const prefillEmail = params.get('email');
        const prefillAmount = params.get('amount');
        if (prefillEmail) setReceiverEmail(prefillEmail);
        if (prefillAmount) setAmount(prefillAmount);
    }, [location]);

    const fetchBalance = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet', config);
            setBalance(res.data.balance);
        } catch (err) { console.error(err); }
    };

    const handleSend = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/transaction/send', 
                { receiver_email: receiverEmail, amount: parseFloat(amount), note }, 
                config
            );
            setStep('success');
        } catch (err) {
            alert(err.response?.data?.message || 'Transaction failed');
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', background: 'var(--bg-card)' }}>
                <div style={{ width: '100px', height: '100px', background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', color: 'white', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0, 200, 83, 0.2)' }}>
                    ✓
                </div>
                <h1 style={{ fontWeight: '800' }}>Sent Successfully!</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>You sent <strong>${parseFloat(amount).toFixed(2)}</strong> to {receiverEmail}</p>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginTop: '40px' }}>Done</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-input)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Send Money</h3>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Recipient Input Card */}
            <div className="card" style={{ padding: '20px', background: 'var(--bg-input)', border: 'none', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700' }}>
                        {receiverEmail ? receiverEmail.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <small style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>To recipient</small>
                        <input 
                            style={{ background: 'none', border: 'none', width: '100%', fontSize: '16px', fontWeight: '700', outline: 'none', padding: '4px 0' }}
                            placeholder="Email, name or phone"
                            value={receiverEmail}
                            onChange={(e) => setReceiverEmail(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Amount Focus Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-muted)' }}>$</span>
                    <input 
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ 
                            fontSize: '80px', 
                            fontWeight: '800', 
                            border: 'none', 
                            background: 'none', 
                            outline: 'none', 
                            width: `${Math.max(160, (amount.toString().length || 1) * 55)}px`, 
                            textAlign: 'center',
                            transition: 'width 0.2s ease'
                        }}
                    />
                </div>
                <div style={{ 
                    background: (amount && (balance - parseFloat(amount)) < 0) ? '#fee2e2' : 'var(--primary-light)', 
                    color: (amount && (balance - parseFloat(amount)) < 0) ? '#ef4444' : 'var(--primary)', 
                    padding: '8px 20px', 
                    borderRadius: '20px', 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    marginTop: '15px',
                    transition: 'all 0.3s ease',
                    border: (amount && (balance - parseFloat(amount)) < 0) ? '1px solid #fecaca' : 'none'
                }}>
                    {amount && !isNaN(amount) && parseFloat(amount) > 0 ? (
                        <span>
                            {(balance - parseFloat(amount)) < 0 ? '⚠️ OVERDRAFT ' : 'New Balance: '}
                            ${(balance - parseFloat(amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    ) : (
                        <span>Current Balance: ${parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ paddingBottom: '20px' }}>
                <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
                    <input 
                        placeholder="Add a note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{ background: 'none', border: 'none', width: '100%', fontSize: '15px', outline: 'none' }}
                    />
                </div>

                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', height: '60px', fontSize: '18px' }}
                    onClick={handleSend}
                    disabled={loading || !amount || !receiverEmail}
                >
                    {loading ? 'Processing Transaction...' : 'Continue'}
                </button>
                
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '15px' }}>
                    🛡️ AI-Powered Fraud Protection Enabled
                </p>
            </div>
        </div>
    );
};

export default SendMoney;
