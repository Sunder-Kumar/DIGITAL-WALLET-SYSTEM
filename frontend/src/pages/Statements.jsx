import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Statements = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    }, []);

    const fetchStatement = async (m, y) => {
        setLoading(true);
        setSelectedMonth({ m, y });
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/transactions/statement?month=${m}&year=${y}`, config);
            setData(res.data);
            setTimeout(() => {
                document.getElementById('statement-preview-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch statement");
        } finally {
            setLoading(false);
        }
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getRecentMonths = () => {
        const list = [];
        const date = new Date();
        for (let i = 0; i < 6; i++) {
            list.push({
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                label: i === 0 ? `${months[date.getMonth()]} ${date.getFullYear()} - Present` : `${months[date.getMonth()]} ${date.getFullYear()}`
            });
            date.setMonth(date.getMonth() - 1);
        }
        return list;
    };

    const recentMonths = getRecentMonths();

    const formatDateRange = () => {
        if (!selectedMonth) return '';
        const { m, y } = selectedMonth;
        const start = `01 ${months[m-1].substring(0, 3)} ${y}`;
        const lastDay = new Date(y, m, 0).getDate();
        const end = `${lastDay} ${months[m-1].substring(0, 3)} ${y}`;
        return `${start} - ${end}`;
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', background: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', fontSize: '24px', color: 'var(--text-main)', cursor: 'pointer' }}>←</button>
                <h2 style={{ margin: '0 0 0 15px', fontWeight: '800', fontSize: '20px' }}>Statements</h2>
            </div>

            <div className="no-print">
                <section style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>Withholding Tax Certificate</h3>
                    <div className="card" style={{ padding: '18px 20px', borderRadius: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>July 1, 2024 - June 30, 2025</div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>PDF</span>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>Account Statements</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentMonths.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => fetchStatement(item.month, item.year)}
                                className="card" 
                                style={{ 
                                    padding: '18px 20px', 
                                    borderRadius: '22px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    border: selectedMonth?.m === item.month ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: selectedMonth?.m === item.month ? 'var(--primary-light-alpha)' : 'var(--bg-card)'
                                }}
                            >
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.label}</div>
                                <div style={{ display: 'flex', gap: '15px', opacity: loading && selectedMonth?.m === item.month ? 0.5 : 1 }}>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>PDF</span>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>CSV</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: '15px', fontWeight: '600', color: 'var(--text-muted)' }}>Generating Statement...</p>
                </div>
            )}

            {data && !loading && (
                <div id="statement-preview-section" style={{ marginTop: '40px', maxWidth: '1000px', margin: '40px auto 0 auto' }}>
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontWeight: '800' }}>Statement Preview</h4>
                        <button className="btn btn-primary" onClick={() => window.print()} style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '13px' }}>
                            Print / Save
                        </button>
                    </div>

                    <div className="statement-outer-wrapper" style={{ width: '100%', overflowX: 'auto', borderRadius: '24px', boxShadow: '0 15px 45px rgba(0,0,0,0.1)', background: 'white' }}>
                        <div id="nayapay-statement" style={{ background: 'white', padding: '20mm', color: '#1e293b', fontFamily: 'Arial, sans-serif', minWidth: '800px' }}>
                            {/* Standard Header */}
                            <div className="print-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#000' }}>Account Statement</h1>
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>{formatDateRange()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#5d3fd3' }}>SecureWallet</div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="print-user-details" style={{ marginBottom: '40px', fontSize: '13px', lineHeight: '1.6' }}>
                                <div style={{ fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', marginBottom: '10px' }}>{user.name}</div>
                                <p style={{ margin: 0, color: '#475569' }}>123 Digital Plaza, Finance District, Karachi, PAKISTAN</p>
                                <p style={{ margin: '5px 0' }}>{user.email}</p>
                                
                                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '150px 1fr' }}>
                                    <div style={{ color: '#64748b' }}>Wallet ID</div>
                                    <div style={{ fontWeight: '700' }}>{user.name?.toLowerCase().replace(/\s/g, '')}@securewallet</div>
                                    <div style={{ color: '#64748b' }}>Account Number</div>
                                    <div style={{ fontWeight: '700' }}>{user.id?.toString().padStart(11, '0')}</div>
                                    <div style={{ color: '#64748b' }}>IBAN</div>
                                    <div style={{ fontWeight: '700' }}>PK07SWAL12345{user.id?.toString().padStart(11, '0')}</div>
                                </div>
                            </div>

                            {/* Summary Grid */}
                            <div className="print-summary" style={{ borderTop: '2pt solid #000', borderBottom: '2pt solid #000', padding: '15px 0', marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '13px' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Opening Balance</div>
                                    <div style={{ fontWeight: '900' }}>PKR {parseFloat(data.openingBalance).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Total Income</div>
                                    <div style={{ fontWeight: '900', color: '#16a34a' }}>+PKR {parseFloat(data.totalIncome).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Total Spent</div>
                                    <div style={{ fontWeight: '900', color: '#dc2626' }}>-PKR {parseFloat(data.totalSpent).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '5px' }}>Closing Balance</div>
                                    <div style={{ fontWeight: '900' }}>PKR {parseFloat(data.closingBalance).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Main Transaction Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1.5pt solid #000', textAlign: 'left', fontWeight: '900' }}>
                                        <th style={{ padding: '10px 5px', width: '18%' }}>TIME</th>
                                        <th style={{ width: '12%' }}>TYPE</th>
                                        <th style={{ width: '40%' }}>DESCRIPTION</th>
                                        <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT</th>
                                        <th style={{ width: '15%', textAlign: 'right' }}>BALANCE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.transactions.map((t) => (
                                        <tr key={t.transaction_id} style={{ borderBottom: '0.5pt solid #e2e8f0' }}>
                                            <td style={{ padding: '12px 5px' }}>
                                                <div style={{ fontWeight: '700' }}>{new Date(t.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                <div style={{ color: '#64748b', fontSize: '9px' }}>{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '700' }}>{t.transaction_type.toUpperCase()}</div>
                                            </td>
                                            <td style={{ padding: '12px 5px' }}>
                                                <div style={{ fontWeight: '700' }}>{t.entry_type === 'debit' ? `To: ${t.receiver_email}` : `From: ${t.sender_email}`}</div>
                                                <div style={{ fontSize: '9px', color: '#64748b' }}>Txn ID: {t.reference_id || 'SW'+t.transaction_id}</div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: '900', color: t.entry_type === 'debit' ? '#000' : '#16a34a' }}>
                                                {t.entry_type === 'debit' ? '-' : '+'}PKR {parseFloat(t.amount).toLocaleString()}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: '900' }}>
                                                PKR {t.running_balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Print Footer Area */}
                            <div className="print-footer" style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                                    <div>(021) 555-0199 | www.securewallet.com</div>
                                    <div className="dynamic-page-counter"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    @page { 
                        margin: 15mm !important; 
                        size: A4 portrait;
                    }
                    
                    /* Hide App UI */
                    .no-print, .desktop-sidebar, .bottom-nav, .mobile-header { display: none !important; }
                    
                    html, body { 
                        background: white !important; 
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        counter-reset: page;
                    }

                    #root, .app-shell, .main-content {
                        display: block !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        max-width: none !important;
                    }

                    .statement-outer-wrapper { 
                        box-shadow: none !important; 
                        border: none !important; 
                        overflow: visible !important; 
                    }

                    #nayapay-statement { 
                        width: 100% !important;
                        min-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    /* Table Magic */
                    thead { display: table-header-group !important; }
                    tr { break-inside: avoid !important; }
                    table { table-layout: fixed !important; }

                    /* Fix Page Counting */
                    .dynamic-page-counter::after {
                        content: "Page " counter(page);
                        font-weight: 900;
                    }
                    
                    .print-header, .print-user-details, .print-summary {
                        break-inside: avoid !important;
                    }
                }

                .spinner {
                    width: 30px; height: 30px;
                    border: 3px solid rgba(93, 63, 211, 0.1);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Statements;
