import { useNavigate } from 'react-router-dom';

const Privacy = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Privacy Policy</h3>
            </div>

            <div className="mobile-card" style={{ fontSize: '14px', lineHeight: '1.6', color: '#4b5563' }}>
                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>1. Information We Collect</h4>
                <p>We collect your name, email, transaction details, and IP addresses to provide our secure digital wallet service. We also analyze device data for fraud prevention.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>2. AI Analysis & Profiling</h4>
                <p>To ensure security, our AI engine analyzes your spending patterns, location, and amounts to assign risk scores. This automated processing is a critical part of our fraud protection system.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>3. Data Sharing</h4>
                <p>We do not sell your personal data. We may share information with financial partners, identity verification services, or legal authorities when required by law.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>4. Security Measures</h4>
                <p>We use industry-standard encryption (SSL/TLS), password hashing (Bcrypt), and secure tokenization (JWT) to protect your account and transaction data.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>5. Your Rights</h4>
                <p>You have the right to request a copy of your transaction history or account deletion, subject to regulatory data retention requirements for financial records.</p>
            </div>
        </div>
    );
};

export default Privacy;

