import { ref, type Ref } from 'vue'
import { useChannel } from './useChannel'
import { useWebsocket } from './useWebsocket'
import type Room from '@/models/room'
import type Channel from '@/models/channel'
import type ChannelMessage from '@/models/channel_message'

const channelCtrl = useChannel()
const room = ref(null as Room | null)
const channel = ref(null as Channel | null)
const channelMessages = ref([] as ChannelMessage[])
const channels = ref([] as Channel[])
const onSetChannelCallbacks = ref([] as Function[])
const websocket = useWebsocket()

interface ChannelSelector {
    reinit: () => Promise<void>;
    channel: Ref<Channel | null>;
    channelMessages: Ref<ChannelMessage[]>;
    channels: Ref<Channel[]>;
    setChannel: (newChannel: Channel | null) => Promise<void>;
    setChannelMessages: (newChannel: Channel | null) => Promise<void>;
    reinitChannelMessages: () => Promise<void>;
    onSetChannel: (cb: Function) => void;
    setRoom: (newRoom: Room | null) => Promise<void>;
}

export function useChannelSelector() : ChannelSelector {

    async function setRoom(newRoom: Room | null): Promise<void> {
        if (!newRoom || !newRoom.uuid) {
            channel.value = null
            channelMessages.value = []
            channels.value = []
            return
        }

        room.value = newRoom
        await setChannels(newRoom)
    }

    async function setChannels(newRoom: Room | null): Promise<void> {
        if (!newRoom || !newRoom.uuid) {
            channels.value = []
            channel.value = null
            channelMessages.value = []
            return
        }

        const { data: roomChannelsData } = await channelCtrl
            .findAll({ page: 1, limit: 10, room_uuid: newRoom.uuid }) as { data: Channel[] }

        if (!roomChannelsData) {
            channels.value = []
            setChannel(null)
            return
        }

        const sortedByType = roomChannelsData
            .sort((a: Channel, b: Channel) => {
                return a.channel_type_name.localeCompare(b.channel_type_name)
            })

        channels.value = sortedByType
        setChannel(sortedByType.length > 0 ? roomChannelsData[0] : null)
    }

    async function setChannel(newChannel: Channel | null): Promise<void> {
        if (!newChannel || !newChannel.uuid) {
            channel.value = null
            channelMessages.value = []
            websocket.leaveChannel()
            return
        }

        websocket.joinChannel('channel-' + newChannel.uuid)
        channel.value = await channelCtrl.findOne(newChannel.uuid) as Channel
        await setChannelMessages(newChannel)
        onSetChannelCallbacks.value.forEach(cb => cb(newChannel))
    }

    async function setChannelMessages(newChannel: Channel | null): Promise<void> {
        if (!newChannel || !newChannel.uuid) {
            channelMessages.value = []
            return
        }

        const { data: channelMessagesData } = await channelCtrl.messages.findAll({
            page: 1, limit: 10, channel_uuid: newChannel.uuid
        }) as { data: ChannelMessage[] }

        channelMessages.value = channelMessagesData.reverse()
    }

    async function reinit(): Promise<void> {
        if (room.value) {
            await setRoom(room.value)
        }
    }

    async function reinitChannelMessages(): Promise<void> {
        if (channel.value) {
            await setChannelMessages(channel.value)
        }
    }

    function onSetChannel(cb: Function): void {
        onSetChannelCallbacks.value.push(cb)
    }

    return {
        reinit,
        channel,
        channelMessages,
        channels,
        setChannel,
        setChannelMessages,
        reinitChannelMessages,
        onSetChannel,
        setRoom
    }
}
