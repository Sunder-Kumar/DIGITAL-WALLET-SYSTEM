import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConnectedCards = () => {
    const [cards, setCards] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [cardsRes, banksRes] = await Promise.all([
                axios.get('http://192.168.0.38:5000/api/wallet/cards', { headers }),
                axios.get('http://192.168.0.38:5000/api/wallet/banks', { headers })
            ]);
            
            setCards(cardsRes.data);
            setBanks(banksRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCard = async (cardId) => {
        if (!window.confirm("Are you sure you want to remove this card?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://192.168.0.38:5000/api/wallet/cards/${cardId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to remove card");
        }
    };

    const handleUnlinkBank = async (bankId) => {
        if (!window.confirm("Are you sure you want to unlink this bank account?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://192.168.0.38:5000/api/wallet/banks/${bankId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to unlink bank account");
        }
    };

    const handleSetPrimary = async (cardId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://192.168.0.38:5000/api/wallet/cards/${cardId}/primary`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to set primary card");
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Payment Methods</h3>
            </div>

            <h4 style={{ marginBottom: '15px' }}>Debit & Credit Cards</h4>
            {loading ? (
                <p>Loading...</p>
            ) : cards.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--border)', background: 'none' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No cards linked</p>
                </div>
            ) : (
                cards.map(card => (
                    <div key={card.card_id} className="card" style={{ 
                        background: card.brand === 'Visa' ? 'linear-gradient(135deg, #1a1a1a, #4a4a4a)' : 'linear-gradient(135deg, #eb001b, #ff5f00)', 
                        color: 'white', 
                        marginBottom: '12px',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{card.brand}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {card.is_primary ? (
                                    <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px' }}>PRIMARY</span>
                                ) : (
                                    <button 
                                        onClick={() => handleSetPrimary(card.card_id)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Set as Primary
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleRemoveCard(card.card_id)}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', letterSpacing: '2px' }}>•••• •••• ••••</span>
                            <span style={{ fontSize: '16px', fontWeight: '700' }}>{card.last4}</span>
                        </div>
                    </div>
                ))
            )}

            <button 
                onClick={() => navigate('/cards/add')}
                className="btn" 
                style={{ width: '100%', border: '2px dashed var(--border)', background: 'none', color: 'var(--text-main)', marginTop: '10px' }}
            >
                + Add New Card
            </button>

            <h4 style={{ marginTop: '40px', marginBottom: '15px' }}>Bank Accounts</h4>
            {banks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--border)', background: 'none' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No bank accounts linked</p>
                </div>
            ) : (
                banks.map(bank => (
                    <div key={bank.bank_account_id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px', padding: '15px 20px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏦</div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0 }}>{bank.bank_name}</h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                {bank.account_type.charAt(0).toUpperCase() + bank.account_type.slice(1)} •••• {bank.account_number_last4}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', color: 'var(--secondary)', fontWeight: '700', fontSize: '11px', marginBottom: '4px' }}>VERIFIED</span>
                            <button 
                                onClick={() => handleUnlinkBank(bank.bank_account_id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                            >
                                Unlink
                            </button>
                        </div>
                    </div>
                ))
            )}

            <button 
                onClick={() => navigate('/banks/link')}
                className="btn btn-primary" 
                style={{ marginTop: '15px', fontSize: '13px', minHeight: '40px', width: '100%' }}
            >
                Link Bank with Plaid
            </button>
        </div>
    );
};

export default ConnectedCards;
