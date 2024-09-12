import { useRoom } from './useRoom'
import { ref, type Ref } from 'vue';
import type RoomRole from '@/models/room_role';
import type RoomCategory from '@/models/room_category';

const roomCtrl = useRoom()
const roomRoles = ref([] as RoomRole[])
const roomCategories = ref([] as RoomCategory[])

interface RoomTypes {
    init: () => Promise<void>;
    roomRoles: Ref<RoomRole[]>;
    roomCategories: Ref<RoomCategory[]>;
}

export function useRoomTypes() : RoomTypes {

    const init = async () => {
        const { data: rolesData } = await roomCtrl.roles.findAll() as { data: RoomRole[] }
        const { data: categoriesData } = await roomCtrl.categories.findAll() as { data: RoomCategory[] }
        
        roomCategories.value = categoriesData
        roomRoles.value = rolesData
    }

    return {
        init,
        roomRoles,
        roomCategories,
    };
}
