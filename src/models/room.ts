import type RoomSetting from "./room_setting";

export default interface Room {
    uuid: string;
    name: string;
    description: string;
    room_category_name: string;
    avatar_src: string;
    created_at: string;
    updated_at: string;
    setting: RoomSetting;
}
