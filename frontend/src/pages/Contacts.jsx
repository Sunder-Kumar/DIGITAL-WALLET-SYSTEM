import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSynced, setIsSynced] = useState(localStorage.getItem('contacts_synced') === 'true');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const syncContacts = async () => {
        setLoading(true);
        try {
            // Simulate API delay for professional feel
            await new Promise(resolve => setTimeout(resolve, 1500));
            const res = await axios.get('http://192.168.0.38:5000/api/auth/users/search?query=', config);
            setContacts(res.data);
            setIsSynced(true);
            localStorage.setItem('contacts_synced', 'true');
        } catch (err) {
            console.error(err);
            alert("Failed to sync contacts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSynced) {
            fetchContacts();
        }
    }, [isSynced]);

    const fetchContacts = async () => {
        try {
            const res = await axios.get(`http://192.168.0.38:5000/api/auth/users/search?query=${search}`, config);
            setContacts(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (isSynced) {
            const delayDebounceFn = setTimeout(() => {
                fetchContacts();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [search]);

    return (
        <div style={{ padding: '24px', paddingBottom: '100px', background: 'var(--bg-app)', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', boxShadow: 'var(--shadow)', color: 'var(--text-main)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800' }}>Contacts</h3>
                <div style={{ width: '40px' }}></div>
            </div>

            {!isSynced ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '30px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>👥</div>
                    <h3 style={{ marginBottom: '10px' }}>Sync your contacts</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px', lineHeight: '1.5' }}>
                        Find your friends and family on SecureWallet instantly by syncing your phone contacts.
                    </p>
                    <button 
                        className="btn btn-primary" 
                        onClick={syncContacts} 
                        disabled={loading}
                        style={{ width: '100%', height: '55px', borderRadius: '18px', fontWeight: '700', fontSize: '16px' }}
                    >
                        {loading ? 'Syncing...' : 'Sync Contacts'}
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ position: 'relative', marginBottom: '25px' }}>
                        <input 
                            type="text" 
                            placeholder="Search name or email..." 
                            className="input-field"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '45px', height: '50px', borderRadius: '15px' }}
                        />
                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>

                    <h4 style={{ marginBottom: '15px', fontSize: '14px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>People on SecureWallet</h4>
                    
                    <div className="card" style={{ padding: '10px 20px', borderRadius: '25px' }}>
                        {contacts.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No contacts found</p>
                        ) : (
                            contacts.map(user => (
                                <div 
                                    key={user.user_id} 
                                    onClick={() => navigate(`/send?email=${user.email}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                >
                                    <div style={{ 
                                        width: '45px', 
                                        height: '45px', 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, var(--primary), #8e78ff)', 
                                        color: 'white', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontWeight: '800',
                                        fontSize: '16px'
                                    }}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '15px' }}>{user.name}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
                                    </div>
                                    <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>SEND</span>
                                </div>
                            ))
                        )}
                    </div>

                    <button 
                        onClick={() => {
                            localStorage.removeItem('contacts_synced');
                            setIsSynced(false);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', width: '100%', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Reset Sync Settings
                    </button>
                </>
            )}
        </div>
    );
};

export default Contacts;
