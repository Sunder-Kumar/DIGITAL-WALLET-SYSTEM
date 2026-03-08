import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent_given');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000); // Show after 2s
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        const fullConsent = { essential: true, analytics: true, marketing: true, personalization: true };
        localStorage.setItem('cookie_preferences', JSON.stringify(fullConsent));
        localStorage.setItem('cookie_consent_given', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner">
            <h4 style={{ margin: '0 0 10px 0' }}>Cookie Consent 🍪</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                We use cookies to ensure you get the best experience on SecureWallet. By clicking "Accept All", you agree to the storing of cookies on your device.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    className="btn btn-primary" 
                    onClick={acceptAll}
                    style={{ flex: 1, minHeight: '40px', fontSize: '13px' }}
                >
                    Accept All
                </button>
                <button 
                    className="btn" 
                    onClick={() => { setIsVisible(false); navigate('/cookie-settings'); }}
                    style={{ flex: 1, minHeight: '40px', fontSize: '13px', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                >
                    Settings
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
