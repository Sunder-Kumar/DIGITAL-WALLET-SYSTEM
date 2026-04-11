import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Terms of Service</h3>
            </div>

            <div className="mobile-card" style={{ fontSize: '14px', lineHeight: '1.6', color: '#4b5563' }}>
                <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>Last Updated: March 2026</p>
                
                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>1. Account Eligibility</h4>
                <p>To use SecureWallet, you must be at least 18 years old and a resident of a supported country. You agree to provide accurate, current, and complete information during the registration process.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>2. Description of Service</h4>
                <p>SecureWallet provides a digital platform for peer-to-peer money transfers, QR payments, and financial insights. We are a technology provider and not a traditional bank.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>3. Prohibited Conduct</h4>
                <p>You agree not to use the service for any illegal activities, including money laundering, fraud, or the purchase of prohibited goods. We reserve the right to freeze accounts suspected of suspicious activity based on our AI Risk Engine.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>4. Transaction Limits</h4>
                <p>Standard accounts are subject to daily transfer limits of Rs. 5,000. These limits may be adjusted based on account verification status and risk scoring.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '20px' }}>5. Limitation of Liability</h4>
                <p>SecureWallet shall not be liable for any indirect, incidental, or consequential damages arising from the use of our digital wallet platform.</p>
            </div>
        </div>
    );
};

export default Terms;

