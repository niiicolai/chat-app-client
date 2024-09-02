import { useAPI } from './useAPI.js';

export function useRoom() {
    const api = useAPI();
    const crudAPI = api.crudAPI('room', 'rooms', {
        _findAll: true,
        _findOne: true,
        _new: false,
        _create: true,
        _update: true,
        _delete: true
    });

    return {
        ...crudAPI,
    };
}
