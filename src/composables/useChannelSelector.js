import { ref } from 'vue'
import { useChannel } from './useChannel.js'

const room = ref(null)
const channelCtrl = useChannel()
const channel = ref(null)
const channelMessages = ref([])
const channels = ref([])

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

        channels.value = roomChannelsData
        setChannel(roomChannelsData.length > 0 ? roomChannelsData[0] : null)
    }

    async function setChannel(newChannel) {
        if (!newChannel || !newChannel.uuid) {
            channel.value = null
            channelMessages.value = []
            return
        }

        channel.value = await channelCtrl.findOne(newChannel.uuid)
        setChannelMessages(newChannel)
    }

    async function reinit() {
        if (room.value) {
            setRoom(room.value)
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
        channelMessages.value = channelMessagesData
    }

    return {
        reinit,
        channel,
        channelMessages,
        channels,
        setChannel,
        setChannelMessages,
        setRoom
    }
}
