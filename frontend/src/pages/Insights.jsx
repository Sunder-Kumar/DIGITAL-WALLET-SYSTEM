import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

const Insights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLORS = ['#5d3fd3', '#00c853', '#ff3d00', '#ffa000', '#00bcd4', '#e91e63', '#9c27b0', '#3f51b5', '#ffeb3b', '#795548'];
    
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get((import.meta.env.VITE_API_URL || 'https://192.168.0.38:5000') + '/api/analytics/insights', config);
            setData(res.data);
        } catch (err) { 
            console.error(err); 
            setError("Unable to load insights. Please make a transaction first.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>🔮 AI Wealth Coach is analyzing your patterns...</div>;

    if (error || !data) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>📊</div>
            <h3>Not enough data yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Make some transactions to unlock real-time financial insights and projections.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '20px', margin: '0 auto' }}>Retry</button>
        </div>
    );

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>Wealth Coach</h3>
            
            <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '30px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: data.health?.color || 'var(--primary)' }}></div>
                <small style={{ color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Financial Health Score</small>
                <h1 style={{ fontSize: '64px', margin: '10px 0', color: data.health?.color || 'var(--text-main)' }}>{data.health?.score || 0}</h1>
                <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: '20px', background: (data.health?.color || '#5d3fd3') + '20', color: data.health?.color || 'var(--primary)', fontWeight: '800', fontSize: '14px' }}>
                    {(data.health?.label || 'Calculating').toUpperCase()}
                </div>
                <p style={{ marginTop: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                    {data.aiCoach?.message}
                </p>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h4>Spending Trajectory</h4>
                <div className="card" style={{ background: 'var(--bg-input)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <small style={{ color: 'var(--text-muted)' }}>Current</small>
                        <h3 style={{ margin: 0 }}>${data.projection?.current || '0.00'}</h3>
                    </div>
                    <div style={{ fontSize: '24px' }}>➔</div>
                    <div style={{ textAlign: 'right' }}>
                        <small style={{ color: 'var(--primary)', fontWeight: '700' }}>Projected EOM</small>
                        <h3 style={{ margin: 0, color: 'var(--primary)' }}>${data.projection?.projected || '0.00'}</h3>
                    </div>
                </div>
            </div>

            {/* Category Breakdown (New Section) */}
            <div style={{ marginTop: '40px' }}>
                <h4>Spending by Category</h4>
                <div className="card" style={{ height: '350px', padding: '20px', marginTop: '15px' }}>
                    {data.categoryData?.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            No category data for this month.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {data.aiCoach?.anomaly && (
                <div className="card" style={{ marginTop: '30px', border: '1px solid var(--danger)', background: 'rgba(255, 61, 0, 0.05)' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ fontSize: '24px' }}>🚨</span>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--danger)' }}>Pattern Alert</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{data.aiCoach.anomaly}</p>
                        </div>
                    </div>
                </div>
            )}

            <h4 style={{ marginTop: '40px', marginBottom: '15px' }}>Spending Velocity</h4>
            <div className="card" style={{ height: '250px', padding: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData || []}>
                        <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                            {data.chartData?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === data.chartData.length - 1 ? 'var(--primary)' : '#e2e8f0'} />
                            ))}
                        </Bar>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }} 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow)', background: 'var(--bg-card)' }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Insights;

