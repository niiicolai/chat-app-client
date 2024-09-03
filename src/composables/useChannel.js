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
        findAll: false,
        findOne: false,
        template: false,
        create: true,
        update: true,
        delete: true
    }) };

    const uploadTypes = { ...api.crudAPI('upload_type', 'upload_types', {
        findAll: false,
        findOne: false,
    }) };

    return {
        ...crudAPI,
        types,
        messages,
        messageUploads,
        uploadTypes
    };
}
