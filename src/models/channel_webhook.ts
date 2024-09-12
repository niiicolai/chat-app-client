import type Channel from "./channel";

export default interface ChannelWebhook {
    uuid: string;
    channel_uuid: string;
    created_at: string;
    updated_at: string;
    channel: Channel;
}
