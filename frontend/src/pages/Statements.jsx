import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Statements = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    }, []);

    const fetchStatement = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://192.168.0.38:5000/api/transactions/statement?month=${month}&year=${year}`, config);
            setData(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch statement");
        } finally {
            setLoading(false);
        }
    };

    const formatDateRange = () => {
        const start = `01 ${months[month-1]} ${year}`;
        const lastDay = new Date(year, month, 0).getDate();
        const end = `${lastDay} ${months[month-1]} ${year}`;
        return `${start} - ${end}`;
    };

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const years = [2024, 2025, 2026];

    return (
        <div style={{ padding: '24px', paddingBottom: '100px', background: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button onClick={() => navigate('/profile')} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>←</button>
                <h3 style={{ margin: '0 auto', fontWeight: '800', color: 'var(--text-main)' }}>Monthly Statements</h3>
            </div>

            <div className="no-print card" style={{ padding: '25px', marginBottom: '30px', borderRadius: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>MONTH</label>
                        <select className="input-field" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>YEAR</label>
                        <select className="input-field" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={fetchStatement} disabled={loading} style={{ width: '100%', height: '50px', borderRadius: '15px' }}>
                    {loading ? 'Processing...' : 'Generate Monthly Statement'}
                </button>
            </div>

            {data && (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="no-print" style={{ marginBottom: '20px' }}>
                        <button className="btn" onClick={() => window.print()} style={{ width: '100%', background: '#1e293b', color: 'white', height: '50px', borderRadius: '15px', fontWeight: '700' }}>
                            🖨️ Print or Save as PDF
                        </button>
                    </div>

                    {/* PDF START */}
                    <div id="nayapay-statement" style={{ background: 'white', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', color: '#1e293b', fontFamily: 'Arial, sans-serif' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#000' }}>Account Statement</h1>
                                <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>{formatDateRange()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>SecureWallet</div>
                            </div>
                        </div>

                        {/* User Details Section */}
                        <div style={{ marginBottom: '40px', fontSize: '13px', lineHeight: '1.6' }}>
                            <div style={{ fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', marginBottom: '10px' }}>{user.name}</div>
                            <p style={{ margin: 0, color: '#475569', maxWidth: '400px' }}>
                                123 Digital Plaza, Finance District, Karachi, PAKISTAN
                            </p>
                            <p style={{ margin: '5px 0' }}>{user.email}</p>
                            
                            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '150px 1fr' }}>
                                <div style={{ color: '#64748b' }}>Wallet ID</div>
                                <div style={{ fontWeight: '700' }}>{user.name?.toLowerCase().replace(' ', '')}@securewallet</div>
                                <div style={{ color: '#64748b' }}>Account Number</div>
                                <div style={{ fontWeight: '700' }}>{user.id?.toString().padStart(11, '0')}</div>
                                <div style={{ color: '#64748b' }}>IBAN</div>
                                <div style={{ fontWeight: '700' }}>PK07SWAL12345{user.id?.toString().padStart(11, '0')}</div>
                            </div>
                        </div>

                        {/* Summary Table */}
                        <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '15px 0', marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '13px' }}>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Opening Balance</div>
                                <div style={{ fontWeight: '900' }}>$ {parseFloat(data.openingBalance).toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Total Income</div>
                                <div style={{ fontWeight: '900', color: '#16a34a' }}>+$ {parseFloat(data.totalIncome).toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Total Spent</div>
                                <div style={{ fontWeight: '900', color: '#dc2626' }}>-$ {parseFloat(data.totalSpent).toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Closing Balance</div>
                                <div style={{ fontWeight: '900' }}>$ {parseFloat(data.closingBalance).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Transaction Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #000', textAlign: 'left', fontWeight: '900' }}>
                                    <th style={{ padding: '10px 0', width: '15%' }}>TIME</th>
                                    <th style={{ width: '15%' }}>TYPE</th>
                                    <th style={{ width: '40%' }}>DESCRIPTION</th>
                                    <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT</th>
                                    <th style={{ width: '15%', textAlign: 'right' }}>BALANCE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.transactions.map((t, i) => (
                                    <tr key={t.transaction_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px 0' }}>
                                            <div style={{ fontWeight: '700' }}>{new Date(t.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div style={{ color: '#64748b', fontSize: '10px' }}>{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td style={{ verticalAlign: 'top', paddingTop: '15px' }}>
                                            <div style={{ fontWeight: '700' }}>{t.transaction_type.charAt(0).toUpperCase() + t.transaction_type.slice(1)}</div>
                                        </td>
                                        <td style={{ padding: '15px 0' }}>
                                            <div style={{ fontWeight: '700' }}>{t.entry_type === 'debit' ? `Transfer to ${t.receiver_email}` : `Fund Received from ${t.sender_email}`}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                                                Transaction ID {t.reference_id || 'SW'+t.transaction_id.toString().padStart(10, '0')} <br />
                                                Service Charges $ 0
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '900', color: t.entry_type === 'debit' ? '#000' : '#16a34a' }}>
                                            {t.entry_type === 'debit' ? '-' : '+'}$ {parseFloat(t.amount).toLocaleString()}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '900' }}>
                                            $ {t.running_balance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Section */}
                        <div style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                                <div>(021) 555-0199 | www.securewallet.com | support@securewallet.com</div>
                                <div style={{ fontWeight: '900' }}>Page 1 of 1</div>
                            </div>
                            <div style={{ marginTop: '20px', fontSize: '9px', color: '#94a3b8', textAlign: 'justify', lineHeight: '1.4' }}>
                                DISCLAIMER: This is an auto-generated statement and doesn't require a signature. Please review the amounts and balance on the
                                statement, in case there is any discrepancy, please inform SecureWallet within 15 days. Otherwise, the statement will be considered
                                accurate. You can use the in-app Dispute Center or reach out to our Customer Support.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    .no-print, .desktop-sidebar, .bottom-nav { display: none !important; }
                    .main-content { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    body { background: white !important; padding: 0 !important; }
                    #nayapay-statement { border: none !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; padding: 20px !important; }
                }
                .input-field {
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    background: var(--bg-input);
                    color: var(--text-main);
                    font-weight: 600;
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default Statements;
