import { useAPI } from './useAPI.js';

export function useRoom() {
    const api = useAPI();
    const crudAPI = api.crudAPI('room', 'rooms', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    });

    const roles = {
        ...api.crudAPI('room_role', 'room_roles', {
            findAll: false,
            findOne: false,
        })
    };

    const categories = {
        ...api.crudAPI('room_category', 'room_categories', {
            findAll: false,
            findOne: false,
        })
    };

    const inviteLinks = {
        ...api.crudAPI('room_invite_link', 'room_invite_links', {
            findAll: true,
            findOne: false,
            template: false,
            create: true,
            update: true,
            delete: true
        })
    };
    inviteLinks.join = async (uuid) => {
        if (!uuid) {
            throw new Error('uuid are required');
        }

        return api.fetchAPI(`/join_link/${uuid}`,
            { method: 'POST' },
            true
        );
    };

    const userRooms = {
        ...api.crudAPI('user_room', 'user_rooms', {
            findAll: true,
            findOne: true,
            template: false,
            create: true,
            update: true,
            delete: true
        })
    };

    const roomSettings = {
        ...api.crudAPI('room_setting', 'room_settings', {
            update: true,
        })
    };

    return {
        ...crudAPI,
        roles,
        categories,
        inviteLinks,
        userRooms,
        roomSettings
    };
}
