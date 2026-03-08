import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const NotificationListener = () => {
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        const socket = io('https://192.168.0.38:5000');

        socket.on('connect', () => {
            socket.emit('join_room', user.id);
        });

        socket.on('PAYMENT_RECEIVED', (data) => {
            toast.success(`💰 Received $${data.amount} from ${data.sender}!`, {
                duration: 5000,
                position: 'top-center',
                style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    borderRadius: '18px',
                    border: '1px solid var(--primary)'
                }
            });
        });

        return () => {
            socket.off('connect');
            socket.off('PAYMENT_RECEIVED');
            socket.disconnect();
        };
    }, []); // Only connect once per session or on manual trigger

    return <Toaster />;
};

export default NotificationListener;
