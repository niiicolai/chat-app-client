import { useChannel } from './useChannel.js'
import { ref } from 'vue';

const channelCtrl = useChannel()
const channelTypes = ref([])
const uploadTypes = ref([])

export function useChannelTypes() {

    const init = async () => {
        const { data: channelTypesData } = await channelCtrl.types.findAll()
        channelTypes.value = channelTypesData

        const { data: uploadTypesData } = await channelCtrl.uploadTypes.findAll()
        uploadTypes.value = uploadTypesData
    }

    return {
        init,
        channelTypes,
        uploadTypes,
    };
}
