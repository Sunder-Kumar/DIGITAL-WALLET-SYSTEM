import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KYC = () => {
    const [idType, setIdType] = useState('passport');
    const [idNumber, setIdNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://192.168.0.38:5000/api/kyc/submit', 
                { id_type: idType, id_number: idNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 3000);
        } catch (err) {
            alert("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📄</div>
                <h2>Documents Received</h2>
                <p style={{ color: 'var(--text-muted)' }}>Our compliance team is reviewing your identity. This usually takes 24-48 hours.</p>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>Back to Home</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', marginBottom: '10px' }}>←</button>
                <h1>Identity Verification</h1>
                <p style={{ color: 'var(--text-muted)' }}>Required for transactions over $1,000</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>DOCUMENT TYPE</label>
                        <select 
                            className="input-field" 
                            value={idType} 
                            onChange={(e) => setIdType(e.target.value)}
                            style={{ width: '100%', marginTop: '8px' }}
                        >
                            <option value="passport">Passport</option>
                            <option value="national_id">National ID Card</option>
                            <option value="drivers_license">Driver's License</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ marginTop: '20px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>DOCUMENT NUMBER</label>
                        <input 
                            className="input-field"
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="Enter ID Number"
                            required
                            style={{ marginTop: '8px' }}
                        />
                    </div>

                    <div className="card" style={{ marginTop: '20px', background: 'var(--bg-app)', border: '2px dashed var(--border)', textAlign: 'center', padding: '40px' }}>
                        <span style={{ fontSize: '30px' }}>📸</span>
                        <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-muted)' }}>Upload Photo of ID</p>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '30px' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit for Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KYC;
