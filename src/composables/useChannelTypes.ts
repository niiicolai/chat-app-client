import { useChannel } from './useChannel'
import { ref, type Ref } from 'vue';
import type ChannelType from '@/models/channel_type';
import type UploadType from '@/models/upload_type';

const channelCtrl = useChannel()
const channelTypes = ref([] as ChannelType[])
const uploadTypes = ref([] as UploadType[])

interface ChannelTypes {
    init: () => Promise<void>;
    uploadTypes: Ref<UploadType[]>;
    channelTypes: Ref<ChannelType[]>;
}

export function useChannelTypes(): ChannelTypes {

    const init = async () => {
        const { data: channelTypesData } = await channelCtrl
            .types.findAll({}) as { data: ChannelType[] }
        const { data: uploadTypesData } = await channelCtrl
            .uploadTypes.findAll({}) as { data: UploadType[] }

        channelTypes.value = channelTypesData
        uploadTypes.value = uploadTypesData
    }

    return {
        init,
        channelTypes,
        uploadTypes,
    };
}
