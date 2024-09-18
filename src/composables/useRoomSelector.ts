import { ref, type Ref } from 'vue'
import { useRoom } from './useRoom'
import { useChannel } from './useChannel'
import { useUser } from './useUser'
import { useChannelSelector } from './useChannelSelector'
import type Room from '@/models/room'
import type UserRoom from '@/models/user_room'
import type RoomInviteLink from '@/models/room_invite_link'
import type RoomFile from '@/models/room_file'
import type Webhook from '@/models/channel_webhook' 

const roomCtrl = useRoom()
const channelCtrl = useChannel()
const userCtrl = useUser()

const rooms = ref([] as Room[])
const room = ref(null as Room | null)
const userRooms = ref([] as UserRoom[])
const userRoom = ref(null as UserRoom | null)
const inviteLinks = ref([] as RoomInviteLink[])
const roomFiles = ref([] as RoomFile[])
const webhooks = ref([] as Webhook[])
const displayLinks = ref(false)
const displayWebhooks = ref(false)

interface RoomSelector {
    room: Ref<Room | null>;
    rooms: Ref<Room[]>;
    inviteLinks: Ref<RoomInviteLink[]>;
    roomFiles: Ref<RoomFile[]>;
    userRooms: Ref<UserRoom[]>;
    userRoom: Ref<UserRoom | null>;
    setRoom: (newRoom: Room | null) => Promise<void>;
    setInviteLinks: (newRoom: Room | null) => Promise<void>;
    setUserRooms: (newRoom: Room | null) => Promise<void>;
    webhooks: Ref<Webhook[]>;
    setWebhooks: (newRoom: Room | null) => Promise<void>;
    reInitRoom: () => Promise<void>;
    reinitRoomFiles: () => Promise<void>;
    reinitWebhooks: () => Promise<void>;
    reinitUserRooms: () => Promise<void>;
    hasRole: (role: string) => boolean;
    fetchRooms: () => Promise<void>;
    reinitInviteLinks: () => Promise<void>;
    displayLinks: Ref<boolean>;
    displayWebhooks: Ref<boolean>;
    toggleDisplayWebhooks: () => void;
    toggleDisplayLinks: () => void;
}

export function useRoomSelector() : RoomSelector {
    async function fetchRooms() : Promise<void> {
        const { data: roomsData } = await roomCtrl.findAll()
        rooms.value = roomsData

        if (room.value) {
            setRoom(room.value)
        }
    }

    async function setRoom(newRoom: Room | null) : Promise<void> {
        const channelSelector = useChannelSelector()

        if (!newRoom || !newRoom.uuid) {
            room.value = null
            channelSelector.setRoom(null)
            setUserRooms(null)
            setInviteLinks(null)
            return
        }

        room.value = await roomCtrl.findOne(newRoom.uuid)

        await setRoomFiles(newRoom)
        await setUserRooms(newRoom)
        await setInviteLinks(newRoom)
        await channelSelector.setRoom(newRoom)
        await setWebhooks(newRoom)
    }

    async function setUserRooms(newRoom: Room | null) : Promise<void> {
        if (!newRoom || !newRoom.uuid) {
            userRooms.value = []
            userRoom.value = null
            return
        }

        const sub = userCtrl.getSub()
        const { data } = await roomCtrl.userRooms.findAll({ room_uuid: newRoom.uuid }) as { data: UserRoom[] }

        if (data && data.length > 0) {
            userRooms.value = data
            userRoom.value = data.find(roomUser => roomUser.user.uuid === sub) || null
        } else {
            userRooms.value = []
            userRoom.value = null
        }
    }

    async function setInviteLinks(newRoom: Room | null) : Promise<void> {
        if (!newRoom || !newRoom.uuid) {
            inviteLinks.value = []
            return
        }

        const { data: roomInviteLinksData } = await roomCtrl
            .inviteLinks
            .findAll({ page: 1, limit: 10, room_uuid: newRoom.uuid }) as { data: RoomInviteLink[] }

        inviteLinks.value = roomInviteLinksData
    }

    async function setRoomFiles(newRoom: Room | null) : Promise<void> {
        if (!newRoom || !newRoom.uuid) {
            roomFiles.value = []
            return
        }

        const { data } = await roomCtrl
            .roomFiles
            .findAll({ room_uuid: newRoom.uuid }) as { data: RoomFile[] }

        roomFiles.value = data
    }

    async function setWebhooks(newRoom: Room | null) : Promise<void> {
        if (!newRoom || !newRoom.uuid || !hasRole('Admin')) {
            webhooks.value = []
            return
        }

        const { data: webhooksData } = await channelCtrl
            .webhooks
            .findAll({ room_uuid: newRoom.uuid }) as { data: Webhook[] }

        webhooks.value = webhooksData
    }

    async function reinitUserRooms() : Promise<void> {
        if (room.value) {
            setUserRooms(room.value)
        }
    }

    async function reinitInviteLinks() : Promise<void> {
        if (room.value) {
            setInviteLinks(room.value)
        }
    }

    async function reinitWebhooks() : Promise<void> {
        if (room.value) {
            setWebhooks(room.value)
        }
    }

    async function reinitRoomFiles() : Promise<void> {
        if (room.value) {
            setRoomFiles(room.value)
        }
    }

    const reInitRoom = async () : Promise<void> => {
        if (room.value) {
            await setRoom(room.value)
        }
    }

    const hasRole = (role: string) : boolean => {
        if (!userRoom.value) return false
        return userRoom.value.room_user_role_name === role
    }

    const toggleDisplayLinks = () : void => {
        displayLinks.value = !displayLinks.value
    }

    const toggleDisplayWebhooks = () : void => {
        displayWebhooks.value = !displayWebhooks.value
    }

    return {
        room,
        rooms,
        inviteLinks,
        roomFiles,
        userRooms,
        userRoom,
        setRoom,
        setInviteLinks,
        setUserRooms,
        webhooks,
        setWebhooks,
        reInitRoom,
        reinitRoomFiles,
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
