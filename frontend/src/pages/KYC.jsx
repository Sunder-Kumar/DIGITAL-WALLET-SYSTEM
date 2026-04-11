import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const KYC = () => {
    const [idType, setIdType] = useState('national_id');
    const [idNumber, setIdNumber] = useState('');
    const [files, setFiles] = useState({ selfie: null, front: null, back: null });
    const [previews, setPreviews] = useState({ selfie: '', front: '', back: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error("File too large (Max 2MB)");
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setFiles(prev => ({ ...prev, [type]: reader.result }));
                setPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!files.selfie || !files.front || !files.back) {
            return toast.error("Please upload all required photos");
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/kyc/submit', 
                { 
                    id_type: idType, 
                    id_number: idNumber,
                    selfie: files.selfie,
                    cnic_front: files.front,
                    cnic_back: files.back
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(true);
            toast.success("Documents submitted successfully!");
        } catch (err) {
            toast.error("Submission failed. Check file sizes.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>🕒</div>
                <h2 style={{ fontWeight: '800' }}>Verification Pending</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Your documents are being reviewed by our compliance team. This usually takes 2-4 hours during business days.</p>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '30px', width: '100%' }}>Back to Dashboard</button>
            </div>
        );
    }

    const UploadBox = ({ type, label, icon }) => (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
            <div 
                onClick={() => document.getElementById(`file-${type}`).click()}
                style={{ 
                    height: '140px', 
                    background: previews[type] ? `url(${previews[type]}) center/cover` : 'var(--bg-input)', 
                    borderRadius: '18px', 
                    border: '2px dashed var(--border)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {!previews[type] && (
                    <>
                        <span style={{ fontSize: '32px' }}>{icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginTop: '10px' }}>Tap to upload</span>
                    </>
                )}
                {previews[type] && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px', fontSize: '10px', textAlign: 'center', fontWeight: '700' }}>CHANGE PHOTO</div>
                )}
            </div>
            <input id={`file-${type}`} type="file" accept="image/*" onChange={(e) => handleFileChange(e, type)} style={{ display: 'none' }} />
        </div>
    );

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: 'var(--text-main)', marginBottom: '15px' }}>←</button>
                <h1 style={{ fontWeight: '900' }}>Identity Verification</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Secure your account and unlock higher limits by verifying your identity.</p>
            </div>

            <div className="card" style={{ padding: '25px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Document Type</label>
                        <select 
                            className="input-field" 
                            value={idType} 
                            onChange={(e) => setIdType(e.target.value)}
                            style={{ width: '100%', height: '55px' }}
                        >
                            <option value="national_id">CNIC (National ID)</option>
                            <option value="passport">Passport</option>
                            <option value="drivers_license">Driver's License</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>ID Number</label>
                        <input 
                            className="input-field"
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="e.g. 42101-XXXXXXX-X"
                            required
                            style={{ height: '55px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                        <UploadBox type="selfie" label="Live Selfie" icon="👤" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <UploadBox type="front" label="CNIC Front" icon="💳" />
                            <UploadBox type="back" label="CNIC Back" icon="💳" />
                        </div>
                    </div>

                    <div style={{ background: 'var(--primary-light)', padding: '15px', borderRadius: '15px', marginTop: '10px', marginBottom: '30px' }}>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--primary)', fontWeight: '700', lineHeight: '1.5' }}>
                            🛡️ Your data is encrypted and stored securely. We only use this information for legal compliance.
                        </p>
                    </div>

                    <button 
                        type="submit"
                        className="btn btn-primary" 
                        style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '16px', fontWeight: '800' }} 
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : 'Submit for Verification'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KYC;
