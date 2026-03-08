import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Bills = () => {
    const [step, setStep] = useState('categories'); // 'categories' | 'details' | 'confirm'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBiller, setSelectedBiller] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = [
        { name: 'Utilities', icon: '⚡', billers: ['General Electric', 'City Water', 'Waste Mgmt'], standardCategory: 'Electricity Bill' },
        { name: 'Internet', icon: '🌐', billers: ['Xfinity', 'AT&T Fiber', 'Starlink'], standardCategory: 'Internet / Mobile Recharge' },
        { name: 'Mobile', icon: '📱', billers: ['Verizon', 'T-Mobile', 'Mint Mobile'], standardCategory: 'Internet / Mobile Recharge' },
        { name: 'Rent', icon: '🏠', billers: ['Property Group', 'Apartments.com'], standardCategory: 'Rent' }
    ];

    const handlePay = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('https://192.168.0.38:5000/api/transaction/pay-bill', {
                biller_name: selectedBiller,
                amount: parseFloat(amount),
                category: selectedCategory || 'Other'
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Bill paid successfully!");
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Payment failed");
        } finally { setLoading(false); }
    };

    if (step === 'categories') {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                    <h3 style={{ margin: '0 auto' }}>Pay Bills</h3>
                </div>
                <div className="adaptive-grid">
                    {categories.map(cat => (
                        <div key={cat.name} className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { setSelectedBiller(cat.billers[0]); setSelectedCategory(cat.standardCategory); setStep('details'); }}>
                            <span style={{ fontSize: '32px' }}>{cat.icon}</span>
                            <h4 style={{ marginTop: '10px' }}>{cat.name}</h4>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => setStep('categories')} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>{selectedBiller}</h3>
            </div>

            <div className="card">
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>AMOUNT TO PAY</label>
                <input 
                    className="input-field" 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '32px', fontWeight: '800', marginTop: '10px' }}
                />
                
                <div style={{ marginTop: '20px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>ACCOUNT NUMBER</label>
                    <input className="input-field" placeholder="Enter Biller Account ID" style={{ marginTop: '8px' }} />
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginTop: '30px' }} onClick={handlePay} disabled={loading || !amount}>
                    {loading ? 'Processing...' : `Pay $${amount || '0.00'}`}
                </button>
            </div>
        </div>
    );
};

export default Bills;
