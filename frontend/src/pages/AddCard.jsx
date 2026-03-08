import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddCard = () => {
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://192.168.0.38:5000/api/wallet/cards', 
                { cardHolder, cardNumber, expiry, cvv },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/cards');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to add card. Check details.");
        } finally {
            setLoading(false);
        }
    };

    // Format card number with spaces
    const formatCardNumber = (val) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i=0, len=match.length; i<len; i+=4) {
            parts.push(match.substring(i, i+4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Add New Card</h3>
            </div>

            {/* Virtual Card Preview */}
            <div className="card" style={{ 
                background: cardNumber.startsWith('4') ? 'linear-gradient(135deg, #1a1a1a, #4a4a4a)' : 'linear-gradient(135deg, #eb001b, #ff5f00)',
                color: 'white',
                minHeight: '180px',
                marginBottom: '30px',
                transition: 'all 0.5s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <span style={{ fontWeight: '700' }}>{cardNumber.startsWith('4') ? 'Visa' : 'Mastercard'}</span>
                    <span style={{ fontSize: '10px' }}>PREVIEW</span>
                </div>
                <div style={{ fontSize: '22px', letterSpacing: '4px', marginBottom: '20px' }}>
                    {cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <small style={{ display: 'block', fontSize: '10px', opacity: 0.7 }}>CARD HOLDER</small>
                        <span>{cardHolder || 'FULL NAME'}</span>
                    </div>
                    <div>
                        <small style={{ display: 'block', fontSize: '10px', opacity: 0.7 }}>EXPIRES</small>
                        <span>{expiry || 'MM/YY'}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleAdd}>
                <div className="input-group">
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CARDHOLDER NAME</label>
                    <input className="input-field" value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="e.g. John Doe" required />
                </div>
                <div className="input-group" style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CARD NUMBER</label>
                    <input className="input-field" maxLength="16" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <div className="input-group">
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>EXPIRY</label>
                        <input className="input-field" maxLength="5" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" required />
                    </div>
                    <div className="input-group">
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CVV</label>
                        <input className="input-field" type="password" maxLength="3" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="•••" required />
                    </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginTop: '40px' }} disabled={loading}>
                    {loading ? 'Validating...' : 'Securely Save Card'}
                </button>
            </form>
        </div>
    );
};

export default AddCard;
