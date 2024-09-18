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

interface RoomFiles extends CrudAPI {
}

const api = useAPI();

const crudAPI = {
    ...api.crudAPI('room', 'rooms', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }) as Rooms,
    editSettings: async (room_uuid: string, data: object) => {
        return api.fetchAPI(`/room/${room_uuid}/settings`,
            { method: 'PATCH', body: JSON.stringify(data) },
            true
        );
    },
    leave: async (room_uuid: string) => {
        return api.fetchAPI(`/room/${room_uuid}/leave`,
            { method: 'DELETE' },
            true
        );
    },
} as Rooms;

const roles = {
    ...api.crudAPI('room_user_role', 'room_user_roles', {
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
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }),
    join: async (uuid: string) => {
        if (!uuid) {
            throw new Error('uuid are required');
        }
        return api.fetchAPI(`/room_invite_link/${uuid}/join`,
            { method: 'POST' },
            true
        );
    }
} as RoomInviteLinks;

const userRooms = {
    ...api.crudAPI('room_user', 'room_users', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    })
} as UserRooms;

const roomFiles = {
    ...api.crudAPI('room_file', 'room_files', {
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    })
} as RoomFiles;

const methods = {
    ...crudAPI,
    roles,
    categories,
    inviteLinks,
    userRooms,
    roomFiles
};

export function useRoom(): any {
    return methods;
}
