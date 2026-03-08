import { useNavigate } from 'react-router-dom';

const Legal = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Legal & Privacy</h3>
            </div>

            <div className="card" style={{ padding: '10px 20px' }}>
                <div onClick={() => navigate('/terms')} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <span>Terms of Service</span>
                    <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
                <div onClick={() => navigate('/privacy')} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <span>Privacy Policy</span>
                    <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
                <div onClick={() => navigate('/cookie-settings')} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', cursor: 'pointer' }}>
                    <span>Cookie Settings</span>
                    <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px', background: '#f1f5f9', border: 'none' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    SecureWallet is a financial technology company, not a bank. Banking services are provided by our partner banks.
                </p>
            </div>
        </div>
    );
};

export default Legal;
