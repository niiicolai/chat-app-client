import { useToast } from './useToast';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
const AUTH_KEY = import.meta.env.VITE_API_LOCAL_STORAGE_KEY;
const onChatMessageCallbacks = [] as ((data: any) => void)[];
const toast = useToast();

interface UseWebsocket {
    onChatMessage: (cb: (data: any) => void) => void;
    joinChannel: (channel: string) => void;
    leaveChannel: () => void;
    socket: WebSocket;
}

export function useWebsocket() : UseWebsocket {
    const socket = new WebSocket(WEBSOCKET_URL, 'echo-protocol');

    socket.onopen = () => {};
    socket.onclose = () => {};
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
            toast.add('WebSocket error: ' + data.error, 'error');
            return;
        } else if (data.type === 'chat_message_created' ||
            data.type === 'chat_message_updated' ||
            data.type === 'chat_message_deleted'
        ) {
            onChatMessageCallbacks.forEach(cb => cb(data));
        }
    };

    const onChatMessage = (cb: (data: any) => void): void => {
        onChatMessageCallbacks.push(cb);
    };

    const joinChannel = (channel: string): void => {
        const token = localStorage.getItem(AUTH_KEY);
        if (!token) {
            throw new Error('No token found in local storage');
        }
        socket.send(JSON.stringify({ type: 'join_channel', channel, token: `Bearer ${token}` }));
    };

    const leaveChannel = (): void => {
        socket.send(JSON.stringify({ type: 'leave_channel' }));
    };

    return {
        onChatMessage,
        joinChannel,
        leaveChannel,
        socket
    };
}
