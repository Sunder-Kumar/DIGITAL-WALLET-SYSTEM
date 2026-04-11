import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const Contacts = () => {
    const [appUsers, setOnAppUsers] = useState([]);
    const [otherContacts, setOtherContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [socket, setSocket] = useState(null);

    const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😻", "🚀", "❤️", "🔥", "👍", "🙌", "✅", "❌"];

    const addEmoji = (emoji) => {
        setMessage(prev => prev + emoji);
    };
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [unreadCounts, setUnreadCounts] = useState(JSON.parse(localStorage.getItem('unreadMessages') || '{}'));
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Track window size for responsiveness
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDesktop = windowWidth >= 1024;

    // Socket Setup
    useEffect(() => {
        if (!storedUser.id) return;

        const newSocket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000'));
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_room', storedUser.id);
        });

        newSocket.on('receive_message', (data) => {
            // Add message to local history regardless of active chat
            const savedMessages = JSON.parse(localStorage.getItem(`chat_${data.senderId}_messages`) || '[]');
            const newMessage = {
                id: Date.now(),
                text: data.text,
                sender: 'them',
                type: data.type || 'text',
                fileUrl: data.fileUrl,
                location: data.location,
                time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            localStorage.setItem(`chat_${data.senderId}_messages`, JSON.stringify([...savedMessages, newMessage]));

            // If we are currently chatting with the sender, update the UI
            const activeChatId = localStorage.getItem('activeChatUserId');
            if (activeChatId === String(data.senderId)) {
                setSelectedChat(prev => {
                    if (prev && prev.user_id === data.senderId) {
                        return { ...prev, messages: [...(prev.messages || []), newMessage] };
                    }
                    return prev;
                });
            }
            // Note: Unread count increment is handled by Layout.jsx globally
        });

        return () => {
            newSocket.off('connect');
            newSocket.off('receive_message');
            newSocket.disconnect();
        };
    }, [storedUser.id]);

    useEffect(() => {
        const handleStorageChange = () => {
            setUnreadCounts(JSON.parse(localStorage.getItem('unreadMessages') || '{}'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedChat, selectedChat?.messages]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/users/search?query=`, config);
            setOnAppUsers(res.data);

            setOtherContacts([
                { id: 101, name: 'Ahmad Hassan', phone: '+92 300 1234567' },
                { id: 102, name: 'Zainab Bibi', phone: '+92 321 7654321' },
                { id: 103, name: 'Hamza Khan', phone: '+92 333 9876543' },
                { id: 104, name: 'Sana Malik', phone: '+92 345 1122334' },
                { id: 105, name: 'Bilal Siddiqui', phone: '+92 312 5566778' },
            ]);
        } catch (err) {
            console.error("Fetch Contacts Error:", err);
        } finally {
            setLoading(false);
        }
    };
    
    const saveMessages = (chatUser, updatedMessages) => {
        localStorage.setItem(`chat_${chatUser.user_id}_messages`, JSON.stringify(updatedMessages));
    };

    const openChat = async (user) => {
        const savedMessages = JSON.parse(localStorage.getItem(`chat_${user.user_id}_messages`) || '[]');
        
        // Fetch transactions between current user and this contact
        let transactions = [];
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/transactions/contact/${user.user_id}`, config);
            transactions = res.data.map(t => ({
                id: `txn_${t.transaction_id}`,
                txnData: t,
                sender: t.sender_wallet_id === storedUser.wallet_id ? 'me' : 'them',
                type: 'transaction',
                timestamp: new Date(t.timestamp),
                time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
        } catch (err) {
            console.error("Failed to fetch contact transactions", err);
        }

        const chatMessages = savedMessages.map(m => ({
            ...m,
            timestamp: m.id ? new Date(m.id) : new Date() // Fallback for old messages
        }));

        // Merge and sort by time
        const allMessages = [...chatMessages, ...transactions].sort((a, b) => a.timestamp - b.timestamp);

        setSelectedChat({
            ...user,
            messages: allMessages.length > 0 ? allMessages : [
                { id: 1, text: `Hello! I'm using SecureWallet.`, sender: 'them', time: 'Yesterday', type: 'text', timestamp: new Date() }
            ]
        });
        
        // Mark as read
        const counts = JSON.parse(localStorage.getItem('unreadMessages') || '{}');
        delete counts[user.user_id];
        localStorage.setItem('unreadMessages', JSON.stringify(counts));
        setUnreadCounts(counts);
        localStorage.setItem('activeChatUserId', user.user_id);
        
        // Trigger a custom event to update Layout.jsx since 'storage' event doesn't fire on same tab
        window.dispatchEvent(new Event('storage'));
    };

    const closeChat = () => {
        setSelectedChat(null);
        localStorage.removeItem('activeChatUserId');
    };

    const sendMessage = (type = 'text', content = null) => {
        if ((type === 'text' && !message.trim()) || !socket || !selectedChat) return;

        const timestamp = new Date();
        const msgData = {
            recipientId: selectedChat.user_id,
            senderId: storedUser.id,
            text: type === 'text' ? message : (type === 'location' ? 'Sent a location' : `Sent a ${type}`),
            name: storedUser.name,
            type: type,
            fileUrl: type === 'image' || type === 'audio' || type === 'file' ? content : null,
            location: type === 'location' ? content : null,
            timestamp: timestamp
        };

        socket.emit('private_message', msgData);

        const newMsg = {
            id: Date.now(),
            text: msgData.text,
            sender: 'me',
            type: type,
            fileUrl: msgData.fileUrl,
            location: msgData.location,
            time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const updatedMessages = [...(selectedChat.messages || []), newMsg];
        setSelectedChat(prev => ({
            ...prev,
            messages: updatedMessages
        }));
        saveMessages(selectedChat, updatedMessages);
        if (type === 'text') setMessage('');
    };

    // --- Media Features ---
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const timerInterval = useRef(null);

    const startRecording = async (e) => {
        if (e) e.preventDefault();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Determine supported mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
                ? 'audio/webm' 
                : (MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : 'audio/mp4');

            mediaRecorder.current = new MediaRecorder(stream, { mimeType });
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: mimeType });
                if (audioBlob.size < 1000) return; // Ignore very short taps

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result;
                    sendMessage('audio', base64Audio);
                };
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            // WhatsApp style timer
            timerInterval.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Mic error:", err);
            alert("Microphone access denied.");
        }
    };

    const stopRecording = (e) => {
        if (e) e.preventDefault();
        if (mediaRecorder.current && isRecording) {
            clearInterval(timerInterval.current);
            mediaRecorder.current.stop();
            setIsRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileUpload = (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'image' ? 'image/*' : (type === 'video' ? 'video/*' : '*/*');
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert("File too large (Max 5MB for prototype)");
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    sendMessage(type, reader.result);
                };
            }
        };
        input.click();
    };

    const shareLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const locationData = { lat: latitude, lng: longitude, label: 'Current Location' };
            sendMessage('location', locationData);
        }, () => {
            alert("Unable to retrieve location");
        });
    };

    const renderContactList = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-app)' }}>
            <div style={{ padding: '20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!isDesktop && <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '24px', color: 'var(--text-main)', cursor: 'pointer', marginRight: '15px' }}>←</button>}
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Contacts</h1>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                <div style={{ padding: '15px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    People on SecureWallet
                </div>
                
                {loading ? (
                    <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing contacts...</p>
                ) : appUsers.length === 0 ? (
                    <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No other users found on SecureWallet yet.</p>
                ) : (
                    appUsers.map(user => (
                        <div 
                            key={user.user_id} 
                            onClick={() => openChat(user)} 
                            style={{ 
                                padding: '12px 20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px', 
                                cursor: 'pointer', 
                                borderBottom: '1px solid var(--border-light)',
                                background: (selectedChat?.user_id === user.user_id) ? 'var(--primary-light)' : (unreadCounts[user.user_id] > 0 ? 'rgba(93, 63, 211, 0.05)' : 'transparent'),
                                transition: 'background 0.3s'
                            }}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: unreadCounts[user.user_id] > 0 ? 'var(--primary)' : 'linear-gradient(135deg, var(--primary), #8e78ff)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', position: 'relative' }}>
                                {user.name.charAt(0)}
                                {unreadCounts[user.user_id] > 0 && (
                                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-card)', fontWeight: '900' }}>
                                        {unreadCounts[user.user_id]}
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: unreadCounts[user.user_id] > 0 ? '900' : '700', fontSize: '15px', display: 'flex', justifyContent: 'space-between', color: unreadCounts[user.user_id] > 0 ? 'var(--primary)' : 'var(--text-main)' }}>
                                    {user.name}
                                    {unreadCounts[user.user_id] > 0 && (
                                        <span style={{ background: 'var(--danger)', color: 'white', fontSize: '9px', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: '900' }}>New</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '12px', color: unreadCounts[user.user_id] > 0 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: unreadCounts[user.user_id] > 0 ? '600' : '400' }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                <div style={{ padding: '30px 20px 15px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Invite to SecureWallet
                </div>
                {otherContacts.map(contact => (
                    <div key={contact.id} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-input)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800' }}>
                            {contact.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>{contact.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{contact.phone}</div>
                        </div>
                        <button style={{ padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--primary)', background: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                            Invite
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const [expandedTxn, setExpandedTxn] = useState(null);

    const TransactionBubble = ({ msg }) => {
        const isMe = msg.sender === 'me';
        const txn = msg.txnData;
        const isExpanded = expandedTxn === msg.id;

        return (
            <div style={{ alignSelf: 'center', width: '100%', maxWidth: '320px', margin: '10px 0' }}>
                <div 
                    onClick={() => setExpandedTxn(isExpanded ? null : msg.id)}
                    style={{ 
                        background: 'var(--bg-card)', 
                        borderRadius: '20px', 
                        padding: '15px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: '35px', height: '35px', borderRadius: '50%', 
                            background: isMe ? '#fee2e2' : '#dcfce7',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px'
                        }}>
                            {isMe ? '↗️' : '↙️'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {isMe ? `YOU SENT ${selectedChat.name}` : `${selectedChat.name} SENT YOU`}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>
                                Rs. {parseFloat(txn.amount).toLocaleString()}
                            </div>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{msg.time}</div>
                    </div>

                    {isExpanded && (
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed var(--border)', fontSize: '12px', animation: 'fadeIn 0.3s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
                                <span style={{ fontWeight: '700' }}>{txn.reference_id || `SW${txn.transaction_id}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                                <span style={{ fontWeight: '700' }}>Rs. {parseFloat(txn.amount).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Fee</span>
                                <span style={{ fontWeight: '700' }}>Rs. {parseFloat(txn.fee || 0).toFixed(2)}</span>
                            </div>
                            {txn.note && (
                                <div style={{ marginBottom: '15px' }}>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Comments</span>
                                    <div style={{ background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '10px', fontStyle: 'italic' }}>"{txn.note}"</div>
                                </div>
                            )}
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', height: '35px', fontSize: '12px', borderRadius: '10px' }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/receipt/${txn.transaction_id}`); }}
                            >
                                Get Receipt
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderChatWindow = () => {
        if (!selectedChat) {
            return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--bg-app)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.3 }}>💬</div>
                    <h3 style={{ opacity: 0.5 }}>Select a contact to start chatting</h3>
                    <p style={{ fontSize: '14px', opacity: 0.4 }}>Your messages are end-to-end encrypted</p>
                </div>
            );
        }

        // Group messages by date
        const groupedMessages = [];
        let currentDate = null;

        selectedChat.messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            if (date !== currentDate) {
                groupedMessages.push({ type: 'date', date, id: `date_${msg.timestamp}` });
                currentDate = date;
            }
            groupedMessages.push(msg);
        });

        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-app)', position: 'relative' }}>
                {/* Chat Header */}
                <div style={{ padding: '15px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {!isDesktop && <button onClick={closeChat} style={{ background: 'none', border: 'none', fontSize: '24px', color: 'var(--primary)', cursor: 'pointer' }}>←</button>}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                        {selectedChat.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{selectedChat.name}</div>
                        <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>Online</div>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {groupedMessages.map(msg => {
                        if (msg.type === 'date') {
                            return (
                                <div key={msg.id} style={{ alignSelf: 'center', margin: '20px 0', background: 'var(--bg-input)', padding: '4px 15px', borderRadius: '15px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                                    {msg.date}
                                </div>
                            );
                        }

                        if (msg.type === 'transaction') {
                            return <TransactionBubble key={msg.id} msg={msg} />;
                        }

                        return (
                            <div key={msg.id} style={{ alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                <div style={{ 
                                    padding: '12px 16px', 
                                    borderRadius: msg.sender === 'me' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    background: msg.sender === 'me' ? 'var(--primary)' : 'var(--bg-card)',
                                    color: msg.sender === 'me' ? 'white' : 'var(--text-main)',
                                    fontSize: '14px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}>
                                    {msg.type === 'text' && msg.text}
                                    {msg.type === 'audio' && <audio controls src={msg.fileUrl} style={{ maxWidth: '200px', height: '35px' }} />}
                                    {msg.type === 'image' && <img src={msg.fileUrl} alt="Sent" style={{ maxWidth: '100%', borderRadius: '12px', cursor: 'pointer' }} onClick={() => window.open(msg.fileUrl)} />}
                                    {msg.type === 'location' && msg.location && (
                                        <div onClick={() => window.open(`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`)} style={{ cursor: 'pointer' }}>
                                            <div style={{ fontSize: '18px', marginBottom: '5px' }}>📍 Location Shared</div>
                                            <div style={{ fontSize: '11px', opacity: 0.8 }}>Click to view on Google Maps</div>
                                        </div>
                                    )}
                                    {msg.type === 'file' && <div onClick={() => window.open(msg.fileUrl)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>📁</span><span>Document</span></div>}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                                    {msg.time}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Chat Input Bar */}
                <div style={{ padding: '10px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', paddingBottom: isDesktop ? '20px' : 'calc(env(safe-area-inset-bottom) + 10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setShowPlusMenu(!showPlusMenu)} style={{ background: 'none', border: 'none', fontSize: '24px', color: 'var(--primary)', cursor: 'pointer' }}>+</button>
                        <button onClick={() => handleFileUpload('image')} style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--text-muted)', cursor: 'pointer' }}>📷</button> 
                        <button onClick={() => navigate(`/send?email=${selectedChat.email}`)} style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--primary)', cursor: 'pointer' }}>💸</button>

                        <div style={{ flex: 1, background: 'var(--bg-input)', borderRadius: '22px', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {!isRecording ? (
                                <span style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => setIsEmojiOpen(!isEmojiOpen)}>😀</span>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--danger)', fontFamily: 'monospace' }}>{formatTime(recordingTime)}</span>
                                </div>
                            )}
                            <input 
                                type="text" 
                                placeholder={isRecording ? "Release to send..." : "Type a message..."}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                disabled={isRecording}
                                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-main)' }}
                            />
                        </div>

                        {message.trim() ? (
                            <button onClick={() => sendMessage()} style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--primary)', cursor: 'pointer' }}>➤</button>
                        ) : (
                            <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} style={{ background: 'none', border: 'none', fontSize: '22px', color: isRecording ? 'var(--danger)' : 'var(--primary)', cursor: 'pointer', transition: 'transform 0.2s' }}>{isRecording ? '⏹️' : '🎙️'}</button>
                        )}
                    </div>
                </div>

                {/* EMOJI DRAWER */}
                {isEmojiOpen && (
                    <>
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.1)', zIndex: 2001 }} onClick={() => setIsEmojiOpen(false)}></div>
                        <div style={{ position: 'absolute', bottom: '80px', left: '20px', right: '20px', maxHeight: '30vh', background: 'var(--bg-card)', zIndex: 2002, borderRadius: '24px', padding: '15px', overflowY: 'auto', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border)', animation: 'slideUp 0.2s ease-out' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', textAlign: 'center' }}>
                                {emojis.map((emoji, idx) => (
                                    <div key={idx} onClick={() => addEmoji(emoji)} style={{ fontSize: '24px', cursor: 'pointer', padding: '5px' }}>{emoji}</div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* PLUS MENU DRAWER */}
                {showPlusMenu && (
                    <>
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2001 }} onClick={() => setShowPlusMenu(false)}></div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '45vh', background: 'var(--bg-card)', zIndex: 2002, borderRadius: '24px 24px 0 0', padding: '25px', animation: 'slideUp 0.3s ease-out' }}>
                            <div style={{ width: '40px', height: '5px', background: 'var(--border)', borderRadius: '10px', margin: '0 auto 25px auto' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
                                {[
                                    { icon: '📷', label: 'Camera', action: () => navigate('/scan') },
                                    { icon: '🎬', label: 'Photos', action: () => handleFileUpload('image') },
                                    { icon: '🎬', label: 'Videos', action: () => handleFileUpload('video') },
                                    { icon: '🎁', label: 'Gift', action: () => alert("Gifts feature coming soon!") },
                                    { icon: '👤', label: 'Contact', action: () => alert("Contact sharing coming soon!") },
                                    { icon: '📁', label: 'File', action: () => handleFileUpload('file') },
                                    { icon: '📍', label: 'Location', action: shareLocation },
                                    { icon: '💰', label: 'Pay', action: () => navigate(`/send?email=${selectedChat.email}`) }
                                ].map((item, idx) => (
                                    <div key={idx} onClick={() => { if(item.action) item.action(); setShowPlusMenu(false); }} style={{ cursor: 'pointer' }}>
                                        <div style={{ width: '55px', height: '55px', background: 'var(--bg-input)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 8px auto' }}>{item.icon}</div>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ 
            display: 'flex', 
            height: isDesktop ? 'calc(100vh - 80px)' : '100vh', 
            background: 'var(--bg-app)',
            position: (!isDesktop && selectedChat) ? 'fixed' : 'relative',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: (!isDesktop && selectedChat) ? 2000 : 1,
            marginTop: isDesktop ? '-40px' : 0, // Compensate for Layout padding
            marginLeft: isDesktop ? '-40px' : 0,
            width: isDesktop ? 'calc(100% + 80px)' : '100%',
        }}>
            {/* List Pane */}
            <div style={{
                width: isDesktop ? '350px' : '100%',
                display: (!isDesktop && selectedChat) ? 'none' : 'flex',
                flexDirection: 'column',
                borderRight: isDesktop ? '1px solid var(--border)' : 'none',
                height: '100%'
            }}>
                {renderContactList()}
            </div>

            {/* Chat Pane */}
            <div style={{
                flex: 1,
                display: (isDesktop || selectedChat) ? 'flex' : 'none',
                flexDirection: 'column',
                height: '100%',
                borderLeft: isDesktop ? '1px solid var(--border)' : 'none'
            }}>
                {renderChatWindow()}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Contacts;
