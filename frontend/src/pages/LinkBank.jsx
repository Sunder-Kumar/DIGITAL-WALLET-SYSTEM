import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LinkBank = () => {
    const [step, setStep] = useState('select'); // 'select' | 'login' | 'success'
    const [selectedBank, setSelectedBank] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const banks = [
        { name: 'Chase', logo: '🏦', color: '#117aca' },
        { name: 'Bank of America', logo: '🏛️', color: '#dc143c' },
        { name: 'Wells Fargo', logo: '🐎', color: '#ffff00', textColor: '#000' },
        { name: 'Citibank', logo: '🏙️', color: '#003b70' },
        { name: 'Capital One', logo: '💳', color: '#004977' }
    ];

    const handleBankSelect = (bank) => {
        setSelectedBank(bank);
        setStep('login');
    };

    const handleSimulateLogin = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/wallet/banks', 
                { bankName: selectedBank.name, accountType: 'checking' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStep('success');
        } catch (err) {
            alert("Linking failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
                <h2>Bank Linked!</h2>
                <p style={{ color: 'var(--text-muted)' }}>You can now transfer funds directly from your <strong>{selectedBank.name}</strong> account.</p>
                <button className="btn btn-primary" onClick={() => navigate('/cards')} style={{ width: '100%', marginTop: '30px' }}>Done</button>
            </div>
        );
    }

    if (step === 'login') {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <button onClick={() => setStep('select')} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                    <h3 style={{ margin: '0 auto' }}>Link {selectedBank.name}</h3>
                </div>
                <div className="card" style={{ textAlign: 'center', background: selectedBank.color, color: selectedBank.textColor || 'white' }}>
                    <span style={{ fontSize: '40px' }}>{selectedBank.logo}</span>
                    <h4 style={{ marginTop: '10px' }}>{selectedBank.name} Online Banking</h4>
                </div>
                <div className="card" style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>SecureWallet uses a secure connection to link your bank. Enter your credentials to continue.</p>
                    <input className="input-field" placeholder="Username" style={{ marginBottom: '15px' }} />
                    <input className="input-field" type="password" placeholder="Password" />
                    <button className="btn btn-primary" onClick={handleSimulateLogin} disabled={loading} style={{ width: '100%', marginTop: '30px' }}>
                        {loading ? 'Connecting...' : 'Authorize Secure Connection'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Select Your Bank</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Choose your institution to link your account securely.</p>
            
            {banks.map(bank => (
                <div 
                    key={bank.name} 
                    onClick={() => handleBankSelect(bank)}
                    className="card" 
                    style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px', cursor: 'pointer', padding: '15px 20px' }}
                >
                    <span style={{ fontSize: '24px' }}>{bank.logo}</span>
                    <span style={{ fontWeight: '600' }}>{bank.name}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>›</span>
                </div>
            ))}

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🛡️ Encrypted connection by Plaid Simulation</p>
            </div>
        </div>
    );
};

export default LinkBank;

