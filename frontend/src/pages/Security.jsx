import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Security = () => {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [pinSet, setPinSet] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [otpToken, setOtpToken] = useState('');
    const [pin, setPin] = useState('');
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [step, setStep] = useState('overview'); // 'overview' | 'setup' | 'set-pin' | 'change-pin'
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://192.168.0.38:5000/api/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMfaEnabled(res.data.mfa_enabled);
            setPinSet(res.data.pin_set);
        } catch (err) { console.error(err); }
    };

    const setupMFA = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://192.168.0.38:5000/api/mfa/setup', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrCode(res.data.qrCode);
            setStep('setup');
        } catch (err) { alert("Failed to initiate MFA setup"); }
    };

    const verifyMFA = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://192.168.0.38:5000/api/mfa/verify', { token: otpToken }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMfaEnabled(true);
            setStep('overview');
            fetchProfile();
        } catch (err) { alert("Invalid OTP code"); }
    };

    const handleSetPin = async () => {
        if (pin.length !== 4) return alert("PIN must be 4 digits");
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://192.168.0.38:5000/api/auth/pin/set', { pin }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPinSet(true);
            setStep('overview');
            setPin('');
            alert("Transaction PIN set successfully!");
        } catch (err) { alert(err.response?.data?.message || "Failed to set PIN"); }
    };

    const handleChangePin = async () => {
        if (newPin.length !== 4) return alert("New PIN must be 4 digits");
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://192.168.0.38:5000/api/auth/pin/change', { oldPin, newPin }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStep('overview');
            setOldPin('');
            setNewPin('');
            alert("Transaction PIN updated successfully!");
        } catch (err) { alert(err.response?.data?.message || "Failed to update PIN"); }
    };

    return (
        <div style={{ padding: '24px', background: 'var(--bg-app)', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => step === 'overview' ? navigate(-1) : setStep('overview')} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', boxShadow: 'var(--shadow)', color: 'var(--text-main)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Security Settings</h3>
                <div style={{ width: '40px' }}></div>
            </div>

            {step === 'overview' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>Two-Factor Auth (2FA)</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Protect your account with TOTP</p>
                            </div>
                            <button 
                                className="btn" 
                                onClick={mfaEnabled ? null : setupMFA}
                                style={{ 
                                    background: mfaEnabled ? 'var(--secondary)' : 'var(--primary)', 
                                    color: 'white',
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    borderRadius: '10px'
                                }}
                            >
                                {mfaEnabled ? 'Enabled' : 'Enable'}
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>Transaction PIN</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{pinSet ? '4-digit PIN is active' : 'Set a PIN for secure transfers'}</p>
                            </div>
                            <button 
                                className="btn" 
                                onClick={() => setStep(pinSet ? 'change-pin' : 'set-pin')}
                                style={{ 
                                    background: 'var(--primary-light)', 
                                    color: 'var(--primary)',
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    borderRadius: '10px',
                                    fontWeight: '700'
                                }}
                            >
                                {pinSet ? 'Change' : 'Set PIN'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : step === 'setup' ? (
                <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                    <h4>Scan with Authenticator</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Use Google Authenticator or Authy</p>
                    <img src={qrCode} alt="QR Code" style={{ width: '200px', margin: '20px 0', borderRadius: '12px' }} />
                    <input 
                        className="input-field" 
                        placeholder="000000" 
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        maxLength={6}
                        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: '800' }}
                    />
                    <button className="btn btn-primary" onClick={verifyMFA} style={{ width: '100%', marginTop: '20px', height: '50px', borderRadius: '15px' }}>Verify & Enable</button>
                </div>
            ) : step === 'set-pin' ? (
                <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                    <h4>Set Transaction PIN</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>Create a 4-digit PIN for sending money</p>
                    <input 
                        type="password"
                        className="input-field" 
                        placeholder="••••" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength={4}
                        style={{ textAlign: 'center', letterSpacing: '15px', fontSize: '32px', fontWeight: '800' }}
                    />
                    <button className="btn btn-primary" onClick={handleSetPin} style={{ width: '100%', marginTop: '30px', height: '50px', borderRadius: '15px' }}>Set PIN</button>
                </div>
            ) : (
                <div className="card" style={{ padding: '30px' }}>
                    <h4 style={{ textAlign: 'center' }}>Change Transaction PIN</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>Update your 4-digit transfer PIN</p>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CURRENT PIN</label>
                        <input 
                            type="password"
                            className="input-field" 
                            placeholder="••••" 
                            value={oldPin}
                            onChange={(e) => setOldPin(e.target.value)}
                            maxLength={4}
                            style={{ textAlign: 'center', letterSpacing: '15px', fontSize: '24px', fontWeight: '800', marginTop: '8px' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>NEW PIN</label>
                        <input 
                            type="password"
                            className="input-field" 
                            placeholder="••••" 
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            maxLength={4}
                            style={{ textAlign: 'center', letterSpacing: '15px', fontSize: '24px', fontWeight: '800', marginTop: '8px' }}
                        />
                    </div>

                    <button className="btn btn-primary" onClick={handleChangePin} style={{ width: '100%', marginTop: '30px', height: '50px', borderRadius: '15px' }}>Update PIN</button>
                </div>
            )}
        </div>
    );
};

export default Security;
