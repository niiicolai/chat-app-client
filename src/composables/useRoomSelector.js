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
const displayLinks = ref(false)

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

        await setUserRooms(newRoom)
        await setInviteLinks(newRoom)
        await channelSelector.setRoom(newRoom)
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

        userRooms.value = userRoomsData
        userRoom.value = userRoomsData.find(userRoom => userRoom.user_uuid === sub)
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

    const hasRole = (role) => {
        if (!userRoom.value) return false
        return userRoom.value.room_role_name === role
    }

    const toggleDisplayLinks = () => {
        displayLinks.value = !displayLinks.value
    }

    return {
        room,
        rooms,
        inviteLinks,
        userRooms,
        userRoom,
        setRoom,
        setInviteLinks,
        setUserRooms,
        hasRole,
        fetchRooms,
        reinitInviteLinks,
        displayLinks,
        toggleDisplayLinks
    }
}
