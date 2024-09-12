import type ChannelMessage from "./channel_message";

export default interface MessageUpload {
    uuid: string;
    src: string;
    upload_type_name: string;
    size: number;
    channel_message_uuid: string;
    created_at: string;
    updated_at: string;
    message: ChannelMessage;
}
