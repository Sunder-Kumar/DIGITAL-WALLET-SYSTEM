import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CookieSettings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        essential: true, // Always true
        analytics: true,
        marketing: false,
        personalization: true
    });

    useEffect(() => {
        const saved = localStorage.getItem('cookie_preferences');
        if (saved) setSettings(JSON.parse(saved));
    }, []);

    const handleToggle = (key) => {
        if (key === 'essential') return;
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const saveSettings = () => {
        localStorage.setItem('cookie_preferences', JSON.stringify(settings));
        localStorage.setItem('cookie_consent_given', 'true');
        alert("Preferences saved successfully!");
        navigate('/legal');
    };

    const categories = [
        { key: 'essential', title: 'Essential Cookies', desc: 'Required for the app to function (e.g., security, login). Cannot be disabled.', disabled: true },
        { key: 'analytics', title: 'Analytics Cookies', desc: 'Help us understand how users interact with the app so we can improve it.', disabled: false },
        { key: 'marketing', title: 'Marketing Cookies', desc: 'Used to deliver relevant advertisements and track ad performance.', disabled: false },
        { key: 'personalization', title: 'Personalization Cookies', desc: 'Allow the app to remember your choices (e.g., theme, language).', disabled: false }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>←</button>
                <h3 style={{ margin: '0 auto' }}>Cookie Settings</h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>
                We use cookies to enhance your experience. You can manage your preferences below.
            </p>

            {categories.map(cat => (
                <div key={cat.key} className="card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{cat.title}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{cat.desc}</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={settings[cat.key]} 
                            onChange={() => handleToggle(cat.key)}
                            disabled={cat.disabled}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            ))}

            <button className="btn btn-primary" onClick={saveSettings} style={{ width: '100%', marginTop: '30px' }}>
                Save My Preferences
            </button>
        </div>
    );
};

export default CookieSettings;

