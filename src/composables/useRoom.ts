import { useAPI, type CrudAPI } from './useAPI';

interface Rooms extends CrudAPI {
}
interface RoomRoles extends CrudAPI {
}
interface RoomCategories extends CrudAPI {
}
interface RoomInviteLinks extends CrudAPI {
    join: (uuid: string) => Promise<object>;
}
interface UserRooms extends CrudAPI {
}
interface RoomSettings extends CrudAPI {
}

const api = useAPI();

const crudAPI = api.crudAPI('room', 'rooms', {
    findAll: true,
    findOne: true,
    template: false,
    create: true,
    update: true,
    delete: true
}) as Rooms;

const roles = {
    ...api.crudAPI('room_role', 'room_roles', {
        findAll: false,
        findOne: false,
        template: false,
        create: true,
        update: true,
        delete: true
    })
} as RoomRoles;

const categories = {
    ...api.crudAPI('room_category', 'room_categories', {
        findAll: false,
        findOne: false,
        template: false,
        create: true,
        update: true,
        delete: true
    })
} as RoomCategories;

const inviteLinks = {
    ...api.crudAPI('room_invite_link', 'room_invite_links', {
        findAll: true,
        findOne: false,
        template: false,
        create: true,
        update: true,
        delete: true
    }),
    join: async (uuid: string) => {
        if (!uuid) {
            throw new Error('uuid are required');
        }
        return api.fetchAPI(`/join_link/${uuid}`,
            { method: 'POST' },
            true
        );
    }
} as RoomInviteLinks;

const userRooms = {
    ...api.crudAPI('user_room', 'user_rooms', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    })
} as UserRooms;

const roomSettings = {
    ...api.crudAPI('room_setting', 'room_settings', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    })
} as RoomSettings;

const methods = {
    ...crudAPI,
    roles,
    categories,
    inviteLinks,
    userRooms,
    roomSettings
};

export function useRoom(): any {
    return methods;
}
