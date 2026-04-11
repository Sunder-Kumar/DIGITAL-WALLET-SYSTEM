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
                axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/wallet/cards', { headers }),
                axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/wallet/banks', { headers })
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
            await axios.delete(`http://localhost:5000/api/wallet/cards/${cardId}`, {
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
            await axios.delete(`http://localhost:5000/api/wallet/banks/${bankId}`, {
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
            await axios.patch(`http://localhost:5000/api/wallet/cards/${cardId}/primary`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to set primary card");
        }
    };

    const [frozenCards, setFrozenCards] = useState(JSON.parse(localStorage.getItem('frozenCards') || '[]'));

    const toggleFreeze = (cardId) => {
        const isFrozen = frozenCards.includes(cardId);
        let newFrozen;
        if (isFrozen) {
            newFrozen = frozenCards.filter(id => id !== cardId);
        } else {
            newFrozen = [...frozenCards, cardId];
        }
        setFrozenCards(newFrozen);
        localStorage.setItem('frozenCards', JSON.stringify(newFrozen));
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate('/profile')} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: 'var(--text-main)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Payment Methods</h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>Debit & Credit Cards</h4>
                <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Manage Security</small>
            </div>

            {loading ? (
                <p>Loading history...</p>
            ) : cards.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--border)', background: 'none' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No cards linked</p>
                </div>
            ) : (
                cards.map(card => {
                    const isFrozen = frozenCards.includes(card.card_id);
                    return (
                        <div key={card.card_id} style={{ marginBottom: '20px' }}>
                            <div className="card" style={{ 
                                background: card.brand === 'Visa' ? 'linear-gradient(135deg, #1a1a1a, #4a4a4a)' : 'linear-gradient(135deg, #eb001b, #ff5f00)', 
                                color: 'white', 
                                marginBottom: '12px',
                                position: 'relative',
                                filter: isFrozen ? 'grayscale(1) opacity(0.8)' : 'none',
                                transition: '0.3s'
                            }}>
                                {isFrozen && (
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 2 }}>
                                        ❄️ CARD FROZEN
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{card.brand}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {card.is_primary && !isFrozen && (
                                            <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px' }}>PRIMARY</span>
                                        )}
                                        <button 
                                            onClick={() => handleRemoveCard(card.card_id)}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
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
                            
                            {/* Card Controls */}
                            <div style={{ display: 'flex', gap: '10px', padding: '0 5px' }}>
                                <button 
                                    onClick={() => toggleFreeze(card.card_id)}
                                    style={{ flex: 1, background: isFrozen ? 'var(--primary)' : 'var(--bg-input)', color: isFrozen ? 'white' : 'var(--text-main)', border: 'none', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {isFrozen ? '🔓 Unfreeze' : '❄️ Freeze Card'}
                                </button>
                                {!card.is_primary && !isFrozen && (
                                    <button 
                                        onClick={() => handleSetPrimary(card.card_id)}
                                        style={{ flex: 1, background: 'var(--bg-input)', color: 'var(--text-main)', border: 'none', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        ⭐ Set Primary
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
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

