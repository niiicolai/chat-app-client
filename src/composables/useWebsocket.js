import { useToast } from './useToast.js';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
const AUTH_KEY = import.meta.env.VITE_API_LOCAL_STORAGE_KEY;
const onChatMessageCallbacks = [];

export function useWebsocket() {
    const socket = new WebSocket(WEBSOCKET_URL, 'echo-protocol');

    socket.onopen = () => {};
    socket.onclose = () => {};

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
            const toast = useToast();
            toast.add('WebSocket error: ' + data.error, 'error');
            return;
        } else if (data.type === 'chat_message') {
            onChatMessageCallbacks.forEach(cb => cb(data));
        }
    };

    

    const onChatMessage = (cb) => {
        onChatMessageCallbacks.push(cb);
    };

    const joinChannel = (channel) => {
        const token = localStorage.getItem(AUTH_KEY);
        if (!token) {
            throw new Error('No token found in local storage');
        }
        socket.send(JSON.stringify({ type: 'join_channel', channel, token: `Bearer ${token}` }));
    };

    const leaveChannel = () => {
        socket.send(JSON.stringify({ type: 'leave_channel' }));
    };

    return {
        onChatMessage,
        joinChannel,
        leaveChannel,
        socket
    };
}
