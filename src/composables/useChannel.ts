import { useAPI, type CrudAPI } from './useAPI';

interface Channels extends CrudAPI {
}

interface Types extends CrudAPI {
}

interface Messages extends CrudAPI {
}

interface UploadTypes extends CrudAPI {
}

interface MessageUploads extends CrudAPI {
    bytesUsed: (room_uuid: string) => Promise<object>;
}

interface Webhooks extends CrudAPI {
    event: (webhook_uuid: string, body: object) => Promise<object>;
}

const api = useAPI();

const crudAPI = api.crudAPI('channel', 'channels', {
    findAll: true,
    findOne: true,
    template: false,
    create: true,
    update: true,
    delete: true
}) as Channels;

const types = {
    ...api.crudAPI('channel_type', 'channel_types', {
        findAll: false,
        findOne: false,
        template: false,
        create: false,
        update: false,
        delete: false
    })
} as Types;

const messages = {
    ...api.crudAPI('channel_message', 'channel_messages', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    })
} as Messages;

const messageUploads = {
    ...api.crudAPI('message_upload', 'message_uploads', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }),
    bytesUsed: async (room_uuid: string) => {
        if (!room_uuid) {
            throw new Error('room_uuid are required');
        }

        return api.fetchAPI(`/bytes_used/${room_uuid}`,
            { method: 'GET' },
            true
        );
    }
} as MessageUploads;

const uploadTypes = {
    ...api.crudAPI('upload_type', 'upload_types', {
        findAll: false,
        findOne: false,
        template: false,
        create: false,
        update: false,
        delete: false
    })
} as UploadTypes;

const webhooks = {
    ...api.crudAPI('channel_webhook', 'channel_webhooks', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }),
    event: async (webhook_uuid: string, body: object) => {
        if (!webhook_uuid) {
            throw new Error('webhook_uuid are required');
        }

        return api.fetchAPI(`/channel_webhook/${webhook_uuid}`,
            { method: 'POST', body: JSON.stringify(body) },
            true
        );
    }
} as Webhooks;

const methods = {
    ...crudAPI,
    types,
    messages,
    messageUploads,
    uploadTypes,
    webhooks
};

export function useChannel(): any {
    return methods;
}
