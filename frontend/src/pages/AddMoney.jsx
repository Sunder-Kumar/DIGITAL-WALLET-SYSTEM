import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddMoney = () => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [methods, setMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchBalance();
        fetchMethods();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet', { headers });
            setBalance(res.data.balance);
        } catch (err) { console.error(err); }
    };

    const fetchMethods = async () => {
        try {
            const [cardsRes, banksRes] = await Promise.all([
                axios.get('http://localhost:5000/api/wallet/cards', { headers }),
                axios.get('http://localhost:5000/api/wallet/banks', { headers })
            ]);
            
            const allMethods = [
                ...cardsRes.data.map(c => ({ id: c.card_id, type: 'card', label: `${c.brand} •••• ${c.last4}`, icon: '💳' })),
                ...banksRes.data.map(b => ({ id: b.bank_account_id, type: 'bank', label: `${b.bank_name} ••• ${b.account_number_last4}`, icon: '🏦' }))
            ];
            setMethods(allMethods);
            if (allMethods.length > 0) setSelectedMethod(allMethods[0]);
        } catch (err) { console.error(err); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!selectedMethod) return alert("Select a payment method");
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/wallet/add-money', {
                amount: parseFloat(amount),
                source_id: selectedMethod.id,
                source_type: selectedMethod.label
            }, { headers });
            navigate('/dashboard');
        } catch (err) {
            alert("Deposit failed");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Add Money</h3>
            </div>

            <div className="card" style={{ textAlign: 'center', background: 'var(--primary-light)', border: 'none', marginBottom: '30px' }}>
                <small style={{ color: 'var(--primary)', fontWeight: '700' }}>ENTER AMOUNT</small>
                <input 
                    className="input-field" 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '40px', fontWeight: '800', textAlign: 'center', background: 'none', border: 'none' }}
                />
                <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)', opacity: 0.8 }}>
                    {amount && !isNaN(amount) && parseFloat(amount) > 0 
                        ? `New Balance: $${(parseFloat(balance) + parseFloat(amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                        : `Current Balance: $${parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </div>
            </div>

            <h4>Select Source</h4>
            <div style={{ margin: '20px 0' }}>
                {methods.length === 0 ? (
                    <button onClick={() => navigate('/cards')} className="btn" style={{ width: '100%', border: '1px dashed var(--border)' }}>+ Link Card or Bank</button>
                ) : (
                    methods.map(m => (
                        <div 
                            key={`${m.type}-${m.id}`}
                            onClick={() => setSelectedMethod(m)}
                            className="card" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px', 
                                marginBottom: '12px', 
                                cursor: 'pointer',
                                border: selectedMethod?.id === m.id ? '2px solid var(--primary)' : '1px solid var(--border)'
                            }}
                        >
                            <span>{m.icon}</span>
                            <span style={{ fontWeight: '600' }}>{m.label}</span>
                            {selectedMethod?.id === m.id && <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>✔</span>}
                        </div>
                    ))
                )}
            </div>

            <button className="btn btn-primary" onClick={handleAdd} disabled={loading || !amount} style={{ width: '100%', marginTop: '20px' }}>
                {loading ? 'Processing...' : `Add $${amount || '0.00'} Instantly`}
            </button>
        </div>
    );
};

export default AddMoney;
