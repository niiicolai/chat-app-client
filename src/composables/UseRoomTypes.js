import { useRoom } from './useRoom.js'
import { ref } from 'vue';

const roomCtrl = useRoom()
const roomRoles = ref([])
const roomCategories = ref([])

export function useRoomTypes() {

    const init = async () => {
        const { data: rolesData } = await roomCtrl.roles.findAll()
        roomRoles.value = rolesData

        const { data: categoriesData } = await roomCtrl.categories.findAll()
        roomCategories.value = categoriesData
    }

    return {
        init,
        roomRoles,
        roomCategories,
    };
}
