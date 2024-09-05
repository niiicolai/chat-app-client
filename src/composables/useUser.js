import { useAPI } from './useAPI.js';

export function useUser() {
    const api = useAPI();
    const crudAPI = api.crudAPI('user', 'users', {
        _findAll: true,
        _findOne: true,
        _new: false,
        _create: false,
        _update: true,
        _delete: true
    });

    const login = async (data) => {
        if (!data.email || !data.password) {
            throw new Error('email and password are required');
        }

        return api.fetchAPI('/login',
            { method: 'POST', body: JSON.stringify(data) },
            false
        );
    };

    const me = async () => {
        return api.fetchAPI('/me',
            { method: 'GET' },
            true
        );
    }

    const logout = async () => {
        api.removeToken();
    }

    const isLoggedIn = () => {
        return !!api.getToken();
    }

    const getSub = () => {
        return api.getToken() ? JSON.parse(atob(api.getToken().split('.')[1])).sub : null;
    }

    return {
        ...crudAPI,
        login,
        logout,
        isLoggedIn,
        me,
        getSub
    };
}
