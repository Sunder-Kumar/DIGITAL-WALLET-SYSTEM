import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const SendMoney = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Core State
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [category, setCategory] = useState('Other');
    const [note, setNote] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); // 'input' | 'pin' | 'success'
    
    // Unified Destination State
    const [destinationType, setDestinationType] = useState('contact'); // 'contact' | 'bank' | 'card'
    const [receiverEmail, setReceiverEmail] = useState('');
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

    const categories = [
        "Grocery", "Food & Dining", "Shopping", "Fuel / Petrol", 
        "Public Transport", "Car Maintenance", "Rent", "Electricity Bill", 
        "Water Bill", "Internet / Mobile Recharge", "Health / Medicine", 
        "Education", "Entertainment", "Travel", "Gifts", 
        "Family Support", "Savings / Investment", "Other"
    ];
    
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
        
        // Handle deep links from Scanner or Contacts
        const params = new URLSearchParams(location.search);
        const prefillEmail = params.get('email');
        const prefillAmount = params.get('amount');
        if (prefillEmail) {
            setReceiverEmail(prefillEmail);
            setDestinationType('contact');
        }
        if (prefillAmount) setAmount(prefillAmount);
    }, [location]);

    const fetchData = async () => {
        try {
            const [walletRes, banksRes, cardsRes] = await Promise.all([
                axios.get('http://192.168.0.38:5000/api/wallet', config),
                axios.get('http://192.168.0.38:5000/api/wallet/banks', config),
                axios.get('http://192.168.0.38:5000/api/wallet/cards', config)
            ]);
            
            setBalance(parseFloat(walletRes.data.balance));
            setBanks(banksRes.data);
            setCards(cardsRes.data);
            
            if (banksRes.data.length > 0) setSelectedBank(banksRes.data[0]);
            if (cardsRes.data.length > 0) setSelectedCard(cardsRes.data.find(c => c.is_primary) || cardsRes.data[0]);
        } catch (err) { console.error(err); }
    };

    const handleUnifiedTransfer = async (e) => {
        if (e) e.preventDefault();
        if (pin.length !== 4) return alert("Please enter your 4-digit PIN");
        setLoading(true);

        try {
            let endpoint = '';
            let payload = { amount: parseFloat(amount), pin };

            if (destinationType === 'contact') {
                endpoint = 'http://192.168.0.38:5000/api/transaction/send';
                payload = { ...payload, receiver_email: receiverEmail, category, note };
            } else if (destinationType === 'bank') {
                endpoint = 'http://192.168.0.38:5000/api/wallet/withdraw';
                payload = { ...payload, bank_id: selectedBank.bank_account_id };
            } else if (destinationType === 'card') {
                endpoint = 'http://192.168.0.38:5000/api/wallet/transfer-to-card';
                payload = { ...payload, card_id: selectedCard.card_id };
            }

            await axios.post(endpoint, payload, config);
            setStep('success');
        } catch (err) {
            alert(err.response?.data?.message || 'Transfer failed');
            setStep('pin');
        } finally {
            setLoading(false);
        }
    };

    const getDestinationLabel = () => {
        if (destinationType === 'contact') return receiverEmail || 'Recipient';
        if (destinationType === 'bank') return selectedBank?.bank_name || 'Bank';
        if (destinationType === 'card') return `${selectedCard?.brand} card (•••• ${selectedCard?.last4})`;
        return '';
    };

    if (step === 'success') {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', background: 'var(--bg-card)' }}>
                <div style={{ width: '100px', height: '100px', background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', color: 'white', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0, 200, 83, 0.2)' }}>
                    ✓
                </div>
                <h1 style={{ fontWeight: '800' }}>Transfer Successful!</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
                    You moved <strong>${parseFloat(amount).toFixed(2)}</strong> to <strong>{getDestinationLabel()}</strong>
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginTop: '40px' }}>Done</button>
            </div>
        );
    }

    if (step === 'pin') {
        return (
            <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <form onSubmit={handleUnifiedTransfer} className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 20px' }}>
                    <h2 style={{ marginBottom: '10px' }}>Enter PIN</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>
                        Authorize transfer of <strong>${parseFloat(amount).toLocaleString()}</strong> to <strong>{getDestinationLabel()}</strong>
                    </p>
                    
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
                        {loading ? 'Verifying...' : 'Confirm & Pay'}
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
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Move Money</h3>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Tab Selector */}
            <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: '15px', padding: '5px', marginBottom: '25px' }}>
                <button 
                    onClick={() => setDestinationType('contact')}
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '12px', background: destinationType === 'contact' ? 'var(--bg-card)' : 'none', color: destinationType === 'contact' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: '0.3s' }}
                >
                    To Contact
                </button>
                <button 
                    onClick={() => setDestinationType('bank')}
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '12px', background: destinationType === 'bank' ? 'var(--bg-card)' : 'none', color: destinationType === 'bank' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: '0.3s' }}
                >
                    To Bank
                </button>
                <button 
                    onClick={() => setDestinationType('card')}
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '12px', background: destinationType === 'card' ? 'var(--bg-card)' : 'none', color: destinationType === 'card' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: '0.3s' }}
                >
                    To Card
                </button>
            </div>

            {/* Dynamic Destination Input */}
            <div className="card" style={{ padding: '20px', background: 'var(--bg-input)', border: 'none', marginBottom: '24px' }}>
                {destinationType === 'contact' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700' }}>
                            {receiverEmail ? receiverEmail.charAt(0).toUpperCase() : '👤'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <small style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Recipient Email</small>
                            <input 
                                style={{ background: 'none', border: 'none', width: '100%', fontSize: '16px', fontWeight: '700', outline: 'none', padding: '4px 0', color: 'var(--text-main)' }}
                                placeholder="Enter email address"
                                value={receiverEmail}
                                onChange={(e) => setReceiverEmail(e.target.value)}
                            />
                        </div>
                    </div>
                ) : destinationType === 'bank' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '50px', height: '50px', background: 'var(--secondary)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏦</div>
                        <div style={{ flex: 1 }}>
                            <small style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>To Bank Account</small>
                            <select 
                                value={selectedBank?.bank_account_id}
                                onChange={(e) => setSelectedBank(banks.find(b => b.bank_account_id === parseInt(e.target.value)))}
                                style={{ width: '100%', background: 'none', border: 'none', fontSize: '16px', fontWeight: '700', outline: 'none', padding: '4px 0', color: 'var(--text-main)', cursor: 'pointer' }}
                            >
                                {banks.length === 0 ? <option style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>No banks linked</option> : banks.map(b => <option key={b.bank_account_id} value={b.bank_account_id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{b.bank_name} (•••• {b.account_number_last4})</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💳</div>
                        <div style={{ flex: 1 }}>
                            <small style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>To Debit/Credit Card</small>
                            <select 
                                value={selectedCard?.card_id}
                                onChange={(e) => setSelectedCard(cards.find(c => c.card_id === parseInt(e.target.value)))}
                                style={{ width: '100%', background: 'none', border: 'none', fontSize: '16px', fontWeight: '700', outline: 'none', padding: '4px 0', color: 'var(--text-main)', cursor: 'pointer' }}
                            >
                                {cards.length === 0 ? <option style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>No cards linked</option> : cards.map(c => <option key={c.card_id} value={c.card_id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{c.brand} (•••• {c.last4})</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Amount Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
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
                            transition: 'width 0.2s ease',
                            color: 'var(--text-main)'
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
                    marginTop: '15px'
                }}>
                    {(balance - parseFloat(amount || 0)) < 0 ? '⚠️ OVERDRAFT ' : 'New Balance: '}
                    ${(balance - parseFloat(amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>

            {/* Additional Fields (Only for Contacts) */}
            {destinationType === 'contact' && (
                <div style={{ marginBottom: '20px' }}>
                    <div className="card" style={{ marginBottom: '15px', padding: '15px' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Purpose</label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ width: '100%', background: 'none', border: 'none', fontSize: '15px', fontWeight: '600', outline: 'none', color: 'var(--text-main)' }}
                        >
                            {categories.map(cat => <option key={cat} value={cat} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="card" style={{ padding: '15px' }}>
                        <input 
                            placeholder="Add a note (optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            style={{ background: 'none', border: 'none', width: '100%', fontSize: '15px', outline: 'none', color: 'var(--text-main)' }}
                        />
                    </div>
                </div>
            )}

            <button 
                className="btn btn-primary" 
                style={{ width: '100%', height: '65px', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}
                onClick={() => setStep('pin')}
                disabled={loading || !amount || (destinationType === 'contact' && !receiverEmail)}
            >
                Continue
            </button>
        </div>
    );
};

export default SendMoney;
