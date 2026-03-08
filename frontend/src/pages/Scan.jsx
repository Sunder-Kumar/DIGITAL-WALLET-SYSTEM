import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const Scan = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode("reader");
        
        // Match qrbox exactly to the visual frame
        const qrConfig = { 
            fps: 20, 
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0
        };

        const onScanSuccess = (decodedText) => {
            console.log("Scan result:", decodedText);
            
            let email = '';
            let amount = '';

            try {
                // Handle 1: Full App URL (e.g., http://localhost:5173/send?email=...&amount=...)
                if (decodedText.includes('/send?')) {
                    const url = new URL(decodedText);
                    email = url.searchParams.get('email') || '';
                    amount = url.searchParams.get('amount') || '';
                } 
                // Handle 2: Legacy pay: prefix (e.g., pay:user@mail.com?amount=10)
                else if (decodedText.startsWith('pay:')) {
                    const parts = decodedText.replace('pay:', '').split('?');
                    email = parts[0];
                    const params = new URLSearchParams(parts[1] || '');
                    amount = params.get('amount') || '';
                }
                // Handle 3: Plain Email
                else if (decodedText.includes('@') && !decodedText.includes(' ')) {
                    email = decodedText;
                }

                if (email) {
                    // Visual feedback: success vibration (if supported)
                    if (navigator.vibrate) navigator.vibrate(100);
                    
                    html5QrCode.stop().then(() => {
                        navigate(`/send?email=${email}&amount=${amount}`);
                    }).catch(err => console.error(err));
                }
            } catch (e) {
                console.error("Failed to parse QR data", e);
            }
        };

        html5QrCode.start({ facingMode: "environment" }, qrConfig, onScanSuccess)
            .catch(err => {
                setError("Camera access denied or not found.");
                console.error(err);
            });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error(err));
            }
        };
    }, [navigate]);

    return (
        <div style={{ height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
            {/* Header Overlays */}
            <div style={{ position: 'absolute', top: '40px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', color: 'white', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                <h3 style={{ margin: 0, fontWeight: '800' }}>Scan to Pay</h3>
                <div style={{ width: 40 }}></div>
            </div>

            {/* Camera Viewport */}
            <div id="reader" style={{ width: '100%', height: '100%' }}></div>

            {/* Focus Blur Overlays (4-Panel System for clean clear hole) */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 'calc(50% - 130px)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 'calc(50% - 130px)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', top: 'calc(50% - 130px)', bottom: 'calc(50% - 130px)', left: 0, width: 'calc(50% - 130px)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', top: 'calc(50% - 130px)', bottom: 'calc(50% - 130px)', right: 0, width: 'calc(50% - 130px)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 4 }}></div>

            {/* Custom Scanner Overlay (Fintech Style) */}
            <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                width: '260px', 
                height: '260px', 
                pointerEvents: 'none',
                zIndex: 5
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '15px 0 0 0' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 15px 0 0' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '0 0 0 15px' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 0 15px 0' }}></div>
                
                {/* Animated Scanning Line */}
                <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '5%', 
                    width: '90%', 
                    height: '2px', 
                    background: 'var(--primary)', 
                    boxShadow: '0 0 15px var(--primary)',
                    animation: 'scan-line 2s infinite linear'
                }}></div>
            </div>

            <style>{`
                @keyframes scan-line {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                #reader__dashboard { display: none !important; }
                #reader__status_span { color: white !important; }
                /* Force hide ALL library-generated borders and outlines */
                #reader * { border: none !important; outline: none !important; }
                #reader video { object-fit: cover !important; height: 100vh !important; width: 100vw !important; }
                canvas { display: none !important; }
            `}</style>

            {/* Bottom Overlay */}
            <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0,
                right: 0,
                padding: '40px 20px 60px 20px',
                textAlign: 'center', 
                color: 'white', 
                zIndex: 10,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
            }}>
                {error ? (
                    <p style={{ color: '#ff4444', fontWeight: '700', marginBottom: '20px' }}>{error}</p>
                ) : (
                    <p style={{ opacity: 0.8, fontSize: '14px', marginBottom: '20px' }}>Center the QR code within the frame</p>
                )}
                <button 
                    className="btn" 
                    style={{ 
                        background: 'white', 
                        color: 'black', 
                        width: '100%', 
                        maxWidth: '280px', 
                        margin: '0 auto', 
                        fontWeight: '700',
                        borderRadius: '16px',
                        height: '56px'
                    }}
                    onClick={() => navigate('/send')}
                >
                    Enter Manually
                </button>
            </div>
        </div>
    );
};

export default Scan;
