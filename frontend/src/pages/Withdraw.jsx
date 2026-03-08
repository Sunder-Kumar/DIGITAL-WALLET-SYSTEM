import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Withdraw = () => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); // 'input' | 'pin'
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchBalance();
        fetchBanks();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await axios.get('http://192.168.0.38:5000/api/wallet', { headers });
            setBalance(parseFloat(res.data.balance));
        } catch (err) { console.error(err); }
    };

    const fetchBanks = async () => {
        try {
            const res = await axios.get('http://192.168.0.38:5000/api/wallet/banks', { headers });
            setBanks(res.data);
            if (res.data.length > 0) setSelectedBank(res.data[0]);
        } catch (err) { console.error(err); }
    };

    const handleWithdraw = async (e) => {
        if (e) e.preventDefault();
        if (!selectedBank) return alert("Select a bank account");
        if (pin.length !== 4) return alert("Enter your 4-digit PIN");
        
        setLoading(true);
        try {
            await axios.post('http://192.168.0.38:5000/api/wallet/withdraw', {
                amount: parseFloat(amount),
                bank_id: selectedBank.bank_account_id,
                pin
            }, { headers });
            
            alert("Withdrawal initiated successfully!");
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Withdrawal failed");
            setStep('pin');
        } finally { setLoading(false); }
    };

    if (step === 'pin') {
        return (
            <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <form onSubmit={handleWithdraw} className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 20px' }}>
                    <h2 style={{ marginBottom: '10px' }}>Authorize Withdrawal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>Confirm transfer of <strong>${parseFloat(amount).toLocaleString()}</strong> to <strong>{selectedBank?.bank_name}</strong></p>
                    
                    <input 
                        type="password" 
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        style={{ width: '100%', fontSize: '40px', letterSpacing: '20px', textAlign: 'center', border: 'none', background: 'var(--bg-input)', padding: '20px', borderRadius: '15px', outline: 'none', color: 'var(--text-main)' }}
                        autoFocus
                    />

                    <button 
                        type="submit"
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '30px', height: '55px', borderRadius: '15px', fontWeight: '700' }}
                        disabled={loading || pin.length !== 4}
                    >
                        {loading ? 'Verifying...' : 'Confirm Withdrawal'}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setStep('input')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '20px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', boxShadow: 'var(--shadow)', color: 'var(--text-main)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Withdraw to Bank</h3>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="card" style={{ textAlign: 'center', background: 'var(--bg-input)', border: 'none', marginBottom: '30px', padding: '30px' }}>
                <small style={{ color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>AMOUNT TO WITHDRAW</small>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginTop: '15px' }}>
                    <span style={{ fontSize: '30px', fontWeight: '800', marginRight: '5px' }}>$</span>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{ fontSize: '50px', fontWeight: '900', textAlign: 'center', background: 'none', border: 'none', width: '200px', outline: 'none', color: 'var(--text-main)' }}
                    />
                </div>
                <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: '700', color: (balance - parseFloat(amount || 0) < 0) ? 'var(--danger)' : 'var(--primary)' }}>
                    Wallet Balance: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>

            <h4>Destination Account</h4>
            <div style={{ margin: '20px 0', flex: 1 }}>
                {banks.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No bank accounts linked</p>
                        <button onClick={() => navigate('/cards')} className="btn btn-primary">Link a Bank</button>
                    </div>
                ) : (
                    banks.map(b => (
                        <div 
                            key={b.bank_account_id}
                            onClick={() => setSelectedBank(b)}
                            className="card" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px', 
                                marginBottom: '12px', 
                                cursor: 'pointer',
                                border: selectedBank?.bank_account_id === b.bank_account_id ? '2px solid var(--primary)' : '1px solid var(--border)'
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>🏦</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700' }}>{b.bank_name}</div>
                                <div style={{ fontSize: '12px', opacity: 0.6 }}>{b.account_type} •••• {b.account_number_last4}</div>
                            </div>
                            {selectedBank?.bank_account_id === b.bank_account_id && <span style={{ color: 'var(--primary)', fontWeight: '900' }}>✔</span>}
                        </div>
                    ))
                )}
            </div>

            <button 
                className="btn btn-primary" 
                onClick={() => setStep('pin')} 
                disabled={loading || !amount || !selectedBank}
                style={{ width: '100%', height: '60px', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}
            >
                Continue
            </button>
        </div>
    );
};

export default Withdraw;
