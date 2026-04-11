import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
            const res = await axios.post(`${API_URL}/api/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
            window.location.reload(); 
        } catch (err) {
            console.error("Login Error:", err);
            if (err.code === 'ERR_NETWORK') {
                setError('Network Error: Cannot connect to backend. This might be due to a Mixed Content block (HTTPS frontend calling HTTP backend).');
            } else {
                setError(err.response?.data?.message || 'Login failed. Please check your credentials and network connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '60px 24px', maxWidth: '450px', margin: '0 auto' }}>
            {/* Branding Section */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    background: 'var(--primary)', 
                    borderRadius: '22px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '36px',
                    margin: '0 auto 24px auto',
                    boxShadow: '0 20px 40px rgba(93, 63, 211, 0.25)',
                    color: 'white'
                }}>
                    S
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '8px' }}>SecureWallet</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>The future of digital finance.</p>
            </div>

            {error && (
                <div style={{ 
                    padding: '16px', 
                    background: '#fee2e2', 
                    color: '#991b1b', 
                    borderRadius: '16px', 
                    marginBottom: '24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    border: '1px solid #fecaca'
                }}>
                    🚫 {error}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '4px', textTransform: 'uppercase' }}>Email Address</label>
                    <input 
                        className="input-field"
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="e.g. alex@example.com"
                        required 
                        style={{ marginTop: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '4px', textTransform: 'uppercase' }}>Password</label>
                    <input 
                        className="input-field"
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        required 
                        style={{ marginTop: '8px' }}
                    />
                </div>
                
                <div style={{ textAlign: 'right', marginBottom: '30px' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
                        Forgot Password?
                    </Link>
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', height: '56px', fontSize: '17px' }}
                    disabled={loading}
                >
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>

            {/* Social / Alternative Login */}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Join SecureWallet</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

