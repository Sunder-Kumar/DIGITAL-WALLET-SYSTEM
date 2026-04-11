import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const NotificationListener = () => {
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '');

        socket.on('connect', () => {
            socket.emit('join_room', user.id);
        });

        socket.on('NOTIFICATION_RECEIVED', (data) => {
            toast.success(
                <div>
                    <b style={{ display: 'block' }}>{data.title}</b>
                    <span style={{ fontSize: '13px' }}>{data.message}</span>
                </div>, 
                {
                    duration: 5000,
                    position: 'top-center',
                    style: {
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        borderRadius: '18px',
                        border: '1px solid var(--primary)',
                        padding: '12px 20px'
                    }
                }
            );
        });

        return () => {
            socket.off('connect');
            socket.off('NOTIFICATION_RECEIVED');
            socket.disconnect();
        };
    }, []); // Only connect once per session or on manual trigger

    return <Toaster />;
};

export default NotificationListener;

