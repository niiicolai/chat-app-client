import type MessageUpload from "./message_upload";
import type User from "./user";

export default interface ChannelMessage {
    uuid: string;
    body: string;
    channel_uuid: string;
    created_by_system: number;
    user_uuid: string;
    created_at: string;
    updated_at: string;
    user: User;
    upload: MessageUpload;
}
