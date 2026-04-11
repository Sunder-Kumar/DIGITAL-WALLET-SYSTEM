import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Receipt = () => {
    const { txnId } = useParams();
    const navigate = useNavigate();
    const [txn, setTxn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
        fetchReceipt();
    }, [txnId]);

    const fetchReceipt = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/transactions/${txnId}`, config);
            setTxn(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load receipt");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Generating receipt...</div>;
    if (!txn) return <div style={{ padding: '50px', textAlign: 'center' }}>Transaction not found</div>;

    const isSender = txn.sender_email === user.email;

    return (
        <div style={{ padding: '20px', background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="no-print" style={{ width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: 'var(--text-main)', boxShadow: 'var(--shadow)' }}>←</button>
                <button className="btn btn-primary" onClick={() => window.print()} style={{ padding: '8px 20px', borderRadius: '12px' }}>Print / Save</button>
            </div>

            <div id="receipt-content" style={{ 
                width: '100%', 
                maxWidth: '450px', 
                background: 'white', 
                borderRadius: '30px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                color: '#1e293b',
                fontFamily: 'Arial, sans-serif'
            }}>
                {/* Top Header Decor */}
                <div style={{ background: 'var(--primary)', padding: '40px 20px', textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '5px' }}>SecureWallet</div>
                    <div style={{ fontSize: '12px', opacity: 0.8, letterSpacing: '1px', textTransform: 'uppercase' }}>Transaction Receipt</div>
                </div>

                {/* Amount Section */}
                <div style={{ padding: '30px', textAlign: 'center', borderBottom: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px', fontWeight: '700' }}>AMOUNT</div>
                    <div style={{ fontSize: '42px', fontWeight: '900', color: '#000' }}>
                        Rs. {parseFloat(txn.amount).toLocaleString()}
                    </div>
                    <div style={{ 
                        marginTop: '15px', 
                        display: 'inline-block', 
                        padding: '6px 16px', 
                        borderRadius: '20px', 
                        background: txn.status === 'completed' ? '#dcfce7' : '#fee2e2',
                        color: txn.status === 'completed' ? '#16a34a' : '#dc2626',
                        fontSize: '12px',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                    }}>
                        {txn.status}
                    </div>
                </div>

                {/* Details List */}
                <div style={{ padding: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        <DetailItem label="Transaction ID" value={txn.reference_id || `SW${txn.transaction_id}`} />
                        <DetailItem label="Date & Time" value={new Date(txn.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                        <DetailItem label="Sender" value={`${txn.sender_name} (${txn.sender_email})`} />
                        <DetailItem label="Receiver" value={`${txn.receiver_name} (${txn.receiver_email})`} />
                        <DetailItem label="Category" value={txn.category} />
                        {txn.note && <DetailItem label="Note" value={`"${txn.note}"`} />}
                        <DetailItem label="Service Fee" value={`Rs. ${parseFloat(txn.fee || 0).toFixed(2)}`} />
                    </div>

                    <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '15px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
                                This is a computer generated receipt and does not require a signature.
                                For support, contact support@securewallet.com
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Decor */}
                <div style={{ height: '10px', background: 'repeating-linear-gradient(45deg, var(--primary), var(--primary) 10px, #8e78ff 10px, #8e78ff 20px)' }}></div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    #receipt-content { box-shadow: none !important; border: 1px solid #eee !important; margin: 0 !important; }
                }
            `}</style>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: '700', wordBreak: 'break-all' }}>{value}</div>
    </div>
);

export default Receipt;
