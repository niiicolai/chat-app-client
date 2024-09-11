import { useAPI } from './useAPI.js';

export function useChannel() {
    const api = useAPI();
    const crudAPI = api.crudAPI('channel', 'channels', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    });

    const types = { ...api.crudAPI('channel_type', 'channel_types', {
        findAll: false,
        findOne: false,
    }) };

    const messages = { ...api.crudAPI('channel_message', 'channel_messages', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }) };

    const messageUploads = { ...api.crudAPI('message_upload', 'message_uploads', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }) };
    messageUploads.bytesUsed = async (room_uuid) => {
        if (!room_uuid) {
            throw new Error('room_uuid are required');
        }

        return api.fetchAPI(`/bytes_used/${room_uuid}`,
            { method: 'GET' },
            true
        );
    };

    const uploadTypes = { ...api.crudAPI('upload_type', 'upload_types', {
        findAll: false,
        findOne: false,
    }) };

    const webhooks = { ...api.crudAPI('channel_webhook', 'channel_webhooks', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }) };
    webhooks.event = async (webhook_uuid, body) => {
        if (!webhook_uuid) {
            throw new Error('webhook_uuid are required');
        }

        return api.fetchAPI(`/channel_webhook/${webhook_uuid}`,
            { method: 'POST', body: JSON.stringify(body) },
            true
        );
    };

    return {
        ...crudAPI,
        types,
        messages,
        messageUploads,
        uploadTypes,
        webhooks
    };
}
