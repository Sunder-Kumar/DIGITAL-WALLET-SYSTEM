import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'https://192.168.0.38:5000') + '/api/register', { name, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px 24px', maxWidth: '450px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', marginBottom: '24px', cursor: 'pointer' }}>←</button>
                <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', margin: '0 0 10px 0' }}>Create Account</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Secure your financial future today.</p>
            </div>

            {error && (
                <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '16px', marginBottom: '24px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginLeft: '4px', textTransform: 'uppercase' }}>Full Name</label>
                    <input 
                        className="input-field"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="John Doe"
                        required 
                        style={{ marginTop: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginLeft: '4px', textTransform: 'uppercase' }}>Email Address</label>
                    <input 
                        className="input-field"
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="name@email.com"
                        required 
                        style={{ marginTop: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginLeft: '4px', textTransform: 'uppercase' }}>Password</label>
                    <input 
                        className="input-field"
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="At least 8 characters"
                        required 
                        style={{ marginTop: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '30px', display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '0 4px' }}>
                    <input type="checkbox" required style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                        I agree to the <Link to="/terms" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Privacy Policy</Link>.
                    </p>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', height: '56px', fontSize: '17px' }}
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Create Free Account'}
                </button>
            </form>

            <p style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                Already a member? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Log In</Link>
            </p>
        </div>
    );
};

export default Register;

