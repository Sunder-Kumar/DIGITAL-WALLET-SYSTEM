import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div style={{ padding: '60px 24px', maxWidth: '450px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <button onClick={() => navigate('/login')} style={{ background: 'var(--bg-input)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', marginBottom: '30px' }}>←</button>
                
                {!submitted ? (
                    <>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>Reset Security PIN</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.5' }}>
                            Don't worry, it happens. Enter your registered email to receive recovery instructions.
                        </p>
                    </>
                ) : null}
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '4px', textTransform: 'uppercase' }}>Recovery Email</label>
                        <input 
                            className="input-field"
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="e.g. yourname@email.com"
                            required 
                            style={{ marginTop: '8px' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', height: '56px', fontSize: '17px' }}
                        disabled={loading || !email}
                    >
                        {loading ? 'Sending Instructions...' : 'Send Recovery Link'}
                    </button>
                </form>
            ) : (
                <div style={{ flex: 1, textAlign: 'center', marginTop: '20px' }}>
                    <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        background: 'var(--primary-light)', 
                        borderRadius: '35px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '50px',
                        margin: '0 auto 30px auto',
                        boxShadow: '0 15px 30px rgba(93, 63, 211, 0.1)'
                    }}>
                        📧
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Check your inbox</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '40px' }}>
                        We've sent a secure recovery link to <br/><strong style={{ color: 'var(--text-main)' }}>{email}</strong>
                    </p>
                    
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="btn" 
                        style={{ width: '100%', height: '56px', background: 'var(--bg-input)', color: 'var(--text-main)', fontWeight: '700', borderRadius: '18px' }}
                    >
                        Resend Email
                    </button>
                </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
