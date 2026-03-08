import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [walletId, setWalletId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const walletRes = await axios.get('http://localhost:5000/api/wallet', config);
            setWalletId(walletRes.data.wallet_id);
            
            const txnRes = await axios.get('http://localhost:5000/api/transactions', config);
            setTransactions(txnRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>All Activity</h3>
            </div>

            <div className="mobile-card" style={{ padding: '0 20px' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Loading history...</p>
                ) : transactions.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions found.</p>
                ) : (
                    transactions.map(txn => {
                        const isSender = txn.sender_wallet_id === walletId;
                        let displayLabel = txn.entity_name;
                        
                        if (txn.transaction_type === 'transfer') {
                            displayLabel = isSender ? `Sent to ${txn.entity_name}` : `Received from ${txn.entity_name}`;
                        } else if (txn.transaction_type === 'deposit') {
                            displayLabel = `Deposit from ${txn.entity_name}`;
                        } else if (txn.transaction_type === 'withdrawal') {
                            displayLabel = `Withdrawal to ${txn.entity_name}`;
                        }

                        return (
                            <div key={txn.transaction_id} className="txn-item">
                                <div className="txn-icon" style={{ 
                                    background: isSender ? '#fee2e2' : '#dcfce7',
                                    color: isSender ? '#ef4444' : '#22c55e'
                                }}>
                                    {isSender ? '📤' : '📥'}
                                </div>
                                <div className="txn-info">
                                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{displayLabel}</div>
                                    <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{new Date(txn.timestamp).toLocaleString()}</small>
                                    {txn.status === 'flagged' && <span style={{ color: 'orange', fontSize: '10px', display: 'block' }}>⚠️ FLAGGED</span>}
                                </div>
                                <div className="txn-amount" style={{ color: isSender ? 'var(--text-main)' : 'var(--secondary)' }}>
                                    {isSender ? '-' : '+'}${parseFloat(txn.amount).toFixed(2)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Transactions;
