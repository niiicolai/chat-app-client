import { ref } from 'vue'
import { useChannel } from './useChannel.js'
import { useWebsocket } from './useWebsocket.js'

const channelCtrl = useChannel()
const room = ref(null)
const channel = ref(null)
const channelMessages = ref([])
const channels = ref([])
const onSetChannelCallbacks = ref([])
const websocket = useWebsocket()

export function useChannelSelector() {
    async function setRoom(newRoom) {
        if (!newRoom || !newRoom.uuid) {
            channel.value = null
            channelMessages.value = []
            channels.value = []
            return
        }

        room.value = newRoom

        const { data: roomChannelsData } = await channelCtrl
            .findAll({ page: 1, limit: 10, room_uuid: newRoom.uuid })
        if (!roomChannelsData) {
            channels.value = []
            setChannel(null)
            return
        }
        const sortedByType = roomChannelsData.sort((a, b) => a.channel_type_name.localeCompare(b.channel_type_name))
        
        channels.value = sortedByType
        setChannel(sortedByType.length > 0 ? roomChannelsData[0] : null)
    }

    async function setChannel(newChannel) {
        if (!newChannel || !newChannel.uuid) {
            channel.value = null
            channelMessages.value = []
            websocket.leaveChannel()
            return
        }

        websocket.joinChannel('channel-' + newChannel.uuid)
        channel.value = await channelCtrl.findOne(newChannel.uuid)
        await setChannelMessages(newChannel)
        onSetChannelCallbacks.value.forEach(cb => cb(newChannel))
    }

    function onSetChannel(cb) {
        onSetChannelCallbacks.value.push(cb)
    }

    async function reinit() {
        if (room.value) {
            await setRoom(room.value)
        }
    }

    async function reinitChannelMessages() {
        if (channel.value) {
            await setChannelMessages(channel.value)
        }
    }

    async function setChannelMessages(newChannel) {
        if (!newChannel || !newChannel.uuid) {
            channelMessages.value = []
            return
        }

        const { data: channelMessagesData } = await channelCtrl.messages.findAll({
            page: 1, limit: 10, channel_uuid: newChannel.uuid
        })
        channelMessages.value = channelMessagesData.reverse()
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
