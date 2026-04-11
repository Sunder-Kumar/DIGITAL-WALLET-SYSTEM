import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    if (!token) return null;

    return (
        <nav className="navbar">
            <h1 style={{ margin: 0 }}>SecureWallet</h1>
            <div>
                <Link to="/dashboard">Dashboard</Link>
                {isAdmin && <Link to="/admin" style={{ marginLeft: '1rem' }}>Admin</Link>}
                <button 
                    onClick={handleLogout} 
                    style={{ marginLeft: '1rem', background: 'transparent', border: '1px solid #ccc', color: '#333' }}
                    className="btn"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

