import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TransferToCard = () => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); // 'input' | 'pin'
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchBalance();
        fetchCards();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet', { headers });
            setBalance(parseFloat(res.data.balance));
        } catch (err) { console.error(err); }
    };

    const fetchCards = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet/cards', { headers });
            setCards(res.data);
            if (res.data.length > 0) {
                const primary = res.data.find(c => c.is_primary) || res.data[0];
                setSelectedCard(primary);
            }
        } catch (err) { console.error(err); }
    };

    const handleTransfer = async (e) => {
        if (e) e.preventDefault();
        if (!selectedCard) return alert("Select a card");
        if (pin.length !== 4) return alert("Enter your 4-digit PIN");
        
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/wallet/transfer-to-card', {
                amount: parseFloat(amount),
                card_id: selectedCard.card_id,
                pin
            }, { headers });
            
            alert("Transfer to card successful!");
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Transfer failed");
            setStep('pin');
        } finally { setLoading(false); }
    };

    if (step === 'pin') {
        return (
            <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <form onSubmit={handleTransfer} className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 20px' }}>
                    <h2 style={{ marginBottom: '10px' }}>Authorize Transfer</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>Confirm transfer of <strong>${parseFloat(amount).toLocaleString()}</strong> to your <strong>{selectedCard?.brand} card (•••• {selectedCard?.last4})</strong></p>
                    
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
                        {loading ? 'Verifying...' : 'Confirm Transfer'}
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
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Transfer to Card</h3>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="card" style={{ textAlign: 'center', background: 'var(--bg-input)', border: 'none', marginBottom: '30px', padding: '30px' }}>
                <small style={{ color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>AMOUNT TO TRANSFER</small>
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

            <h4>Select Destination Card</h4>
            <div style={{ margin: '20px 0', flex: 1 }}>
                {cards.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No cards linked</p>
                        <button onClick={() => navigate('/cards/add')} className="btn btn-primary">Link a Card</button>
                    </div>
                ) : (
                    cards.map(c => (
                        <div 
                            key={c.card_id}
                            onClick={() => setSelectedCard(c)}
                            className="card" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px', 
                                marginBottom: '12px', 
                                cursor: 'pointer',
                                border: selectedCard?.card_id === c.card_id ? '2px solid var(--primary)' : '1px solid var(--border)'
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>💳</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700' }}>{c.brand}</div>
                                <div style={{ fontSize: '12px', opacity: 0.6 }}>{c.card_holder_name} •••• {c.last4}</div>
                            </div>
                            {selectedCard?.card_id === c.card_id && <span style={{ color: 'var(--primary)', fontWeight: '900' }}>✔</span>}
                        </div>
                    ))
                )}
            </div>

            <button 
                className="btn btn-primary" 
                onClick={() => setStep('pin')} 
                disabled={loading || !amount || !selectedCard}
                style={{ width: '100%', height: '60px', borderRadius: '20px', fontSize: '18px', fontWeight: '700' }}
            >
                Continue
            </button>
        </div>
    );
};

export default TransferToCard;
