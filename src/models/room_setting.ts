
export default interface RoomSetting {
    uuid: string;
    total_upload_bytes: number;
    upload_bytes: number;
    rules_text: string;
    join_channel_uuid: string;
    join_message: string;
    max_channels: number;
    max_members: number;
    room_uuid: string;
    created_at: string;
    updated_at: string;
}
