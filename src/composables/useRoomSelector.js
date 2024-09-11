import { ref } from 'vue'
import { useRoom } from './useRoom.js'
import { useChannel } from './useChannel.js'
import { useUser } from './useUser.js'
import { useChannelSelector } from './useChannelSelector.js'

const roomCtrl = useRoom()
const channelCtrl = useChannel()
const userCtrl = useUser()

const rooms = ref(null)
const room = ref(null)
const userRooms = ref([])
const userRoom = ref(null)
const inviteLinks = ref([])
const messageUploads = ref([])
const webhooks = ref([])
const displayLinks = ref(false)
const displayWebhooks = ref(false)

export function useRoomSelector() {
    async function fetchRooms() {
        const { data: roomsData } = await roomCtrl.findAll()
        rooms.value = roomsData

        if (room.value) {
            setRoom(room.value)
        }
    }

    async function setRoom(newRoom) {
        const channelSelector = useChannelSelector()

        if (!newRoom || !newRoom.uuid) {
            room.value = null
            channelSelector.setRoom(null)
            setUserRooms(null)
            setInviteLinks(null)
            return
        }

        room.value = await roomCtrl.findOne(newRoom.uuid)

        await setMessageUploads(newRoom)
        await setUserRooms(newRoom)
        await setInviteLinks(newRoom)
        await channelSelector.setRoom(newRoom)
        await setWebhooks(newRoom)
    }

    async function setUserRooms(newRoom) {
        if (!newRoom || !newRoom.uuid) {
            userRooms.value = []
            userRoom.value = null
            return
        }

        const sub = userCtrl.getSub()
        const { data: userRoomsData } = await roomCtrl.userRooms.findAll({
            room_uuid: newRoom.uuid
        })
        if (userRoomsData && userRoomsData.length > 0) {
            userRooms.value = userRoomsData
            userRoom.value = userRoomsData.find(userRoom => userRoom.user_uuid === sub)
        } else {
            userRooms.value = []
            userRoom.value = null
        }
    }

    async function reinitUserRooms() {
        if (room.value) {
            setUserRooms(room.value)
        }
    }

    async function reinitInviteLinks() {
        if (room.value) {
            setInviteLinks(room.value)
        }
    }

    async function setInviteLinks(newRoom) {
        if (!newRoom || !newRoom.uuid) {
            inviteLinks.value = []
            return
        }

        const { data: roomInviteLinksData } = await roomCtrl
            .inviteLinks
            .findAll({ page: 1, limit: 10, room_uuid: newRoom.uuid })

        inviteLinks.value = roomInviteLinksData
    }

    async function setMessageUploads(newRoom) {
        if (!newRoom || !newRoom.uuid) {
            messageUploads.value = []
            return
        }

        const { data: messageUploadsData } = await channelCtrl
            .messageUploads
            .findAll({ room_uuid: newRoom.uuid })

        messageUploads.value = messageUploadsData
    }

    async function setWebhooks(newRoom) {
        if (!newRoom || !newRoom.uuid || !hasRole('Admin')) {
            webhooks.value = []
            return
        }

        const { data: webhooksData } = await channelCtrl
            .webhooks
            .findAll({ room_uuid: newRoom.uuid })

            console.log(webhooksData)
        webhooks.value = webhooksData
    }

    async function reinitWebhooks() {
        if (room.value) {
            setWebhooks(room.value)
        }
    }

    async function reinitMessageUploads() {
        if (room.value) {
            setMessageUploads(room.value)
        }
    }

    const hasRole = (role) => {
        if (!userRoom.value) return false
        console.log(userRoom.value.room_role_name)
        return userRoom.value.room_role_name === role
    }

    const toggleDisplayLinks = () => {
        displayLinks.value = !displayLinks.value
    }

    const toggleDisplayWebhooks = () => {
        displayWebhooks.value = !displayWebhooks.value
    }

    const reInitRoom = async () => {
        if (room.value) {
            await setRoom(room.value)
        }
    }

    return {
        room,
        rooms,
        inviteLinks,
        messageUploads,
        userRooms,
        userRoom,
        setRoom,
        setInviteLinks,
        setUserRooms,
        webhooks,
        setWebhooks,
        reInitRoom,
        reinitMessageUploads,
        reinitWebhooks,
        reinitUserRooms,
        hasRole,
        fetchRooms,
        reinitInviteLinks,
        displayLinks,
        displayWebhooks,
        toggleDisplayWebhooks,
        toggleDisplayLinks
    }
}
