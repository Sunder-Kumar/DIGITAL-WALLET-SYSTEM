import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Security = () => {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [otpToken, setOtpToken] = useState('');
    const [step, setStep] = useState('overview'); // 'overview' | 'setup'
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setMfaEnabled(user.mfa_enabled);
    }, []);

    const setupMFA = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/mfa/setup', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrCode(res.data.qrCode);
            setStep('setup');
        } catch (err) { alert("Failed to initiate MFA setup"); }
    };

    const verifyMFA = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/mfa/verify', { token: otpToken }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMfaEnabled(true);
            setStep('overview');
            // Update local user state
            const user = JSON.parse(localStorage.getItem('user'));
            user.mfa_enabled = true;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (err) { alert("Invalid OTP code"); }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Security</h3>
            </div>

            {step === 'overview' ? (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                        <div>
                            <h4 style={{ margin: 0 }}>Two-Factor Auth (2FA)</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Secure your account with TOTP</p>
                        </div>
                        <button 
                            className="btn" 
                            onClick={mfaEnabled ? null : setupMFA}
                            style={{ 
                                background: mfaEnabled ? 'var(--secondary)' : 'var(--bg-input)', 
                                color: mfaEnabled ? 'white' : 'var(--text-main)',
                                padding: '8px 16px',
                                fontSize: '12px'
                            }}
                        >
                            {mfaEnabled ? 'Enabled' : 'Enable'}
                        </button>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', padding: '20px 0 10px 0' }}>
                        <h4 style={{ margin: 0 }}>Change Transaction PIN</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Required for transfers over $500</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center' }}>
                    <h4>Scan with Authenticator</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Use Google Authenticator or Authy</p>
                    <img src={qrCode} alt="QR Code" style={{ width: '200px', margin: '20px 0', borderRadius: '12px' }} />
                    <input 
                        className="input-field" 
                        placeholder="Enter 6-digit code" 
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        maxLength={6}
                        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
                    />
                    <button className="btn btn-primary" onClick={verifyMFA} style={{ width: '100%', marginTop: '20px' }}>Verify & Enable</button>
                </div>
            )}
        </div>
    );
};

export default Security;
