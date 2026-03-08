import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const RequestMoney = () => {
    const [amount, setAmount] = useState('');
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/send?email=${user.email}&amount=${amount || 0}`;
        const shareText = `Hey! Send me $${amount || 0} on SecureWallet using this link: ${shareUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SecureWallet Payment Request',
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareUrl);
            alert("✨ Professional Payment Link copied to clipboard!");
        }
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Request Payment</h3>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="card" style={{ 
                textAlign: 'center', 
                padding: '30px 20px', 
                background: 'linear-gradient(135deg, var(--bg-card), #f8fafc)', 
                border: '1px solid var(--border)',
                borderRadius: '30px',
                marginBottom: '30px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.03)'
            }}>
                <small style={{ color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>I want to receive</small>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginTop: '15px' }}>
                    <span style={{ fontSize: '30px', fontWeight: '800', color: 'var(--primary)', marginRight: '5px' }}>$</span>
                    <input 
                        className="input-field" 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{ fontSize: '50px', fontWeight: '900', textAlign: 'center', background: 'none', border: 'none', width: '180px', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="card" style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                borderRadius: '30px',
                border: 'none',
                background: 'var(--bg-card)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.05)'
            }}>
                <div style={{ 
                    padding: '25px', 
                    background: 'white', 
                    borderRadius: '30px', 
                    display: 'inline-block', 
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.1)',
                    border: '10px solid #f1f5f9' 
                }}>
                    <QRCodeSVG value={`${window.location.origin}/send?email=${user.email}&amount=${amount || 0}`} size={200} />
                </div>
                <h4 style={{ marginTop: '25px', marginBottom: '8px', fontSize: '20px', fontWeight: '800' }}>{user.name}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Scan to pay me <strong>{amount ? `$${amount}` : 'any amount'}</strong> instantly on SecureWallet.
                </p>
            </div>

            <div style={{ marginTop: '30px' }}>
                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', height: '60px', borderRadius: '20px', fontSize: '17px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={handleShare}
                >
                    <span>🔗</span> Share Payment Link
                </button>
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '15px' }}>
                    The link will automatically fill in your details for the sender.
                </p>
            </div>
        </div>
    );
};

export default RequestMoney;

