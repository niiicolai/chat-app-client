import { useAPI, type CrudAPI } from './useAPI';

interface Users extends CrudAPI {
}

interface UseUsers {
    findAll: (options: any) => Promise<object>;
    findOne: (id: string) => Promise<object>;
    template: () => Promise<object>;
    create: (data: any, form: any) => Promise<object>;
    update: (id: string, data: any, form: any) => Promise<object>;
    delete: (id: string) => Promise<object>;
    login: (data: object) => Promise<object>;
    logout: () => void;
    isLoggedIn: () => boolean;
    me: () => Promise<object>;
    getSub: () => string | null;
}

const api = useAPI();
const crudAPI = api.crudAPI('user', 'users', {
    findAll: true,
    findOne: true,
    template: false,
    create: false,
    update: true,
    delete: true
}) as Users;

// override the default update

const localStorageKey = import.meta.env.VITE_API_LOCAL_STORAGE_KEY;
crudAPI.update = async (id: string, data: any, form: any): Promise<object> => {
    if (form) {
        const formData = new FormData(form);
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem(import.meta.env.VITE_API_LOCAL_STORAGE_KEY);
        const response = await fetch(`${API_URL}/user/me`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (!response.ok) {
            const res = await response.json();
            const msg = `Error: ${res.error || response.statusText}`;
            throw new Error(msg);
        }
        const json = await response.json();
        if (json.token) {
            localStorage.setItem(localStorageKey, json.token);
        }
        return json;
    }

    return api.fetchAPI(`/user/me`,
        { method: 'PATCH', body: JSON.stringify(data) },
        true
    );
}

const login = async (data: any): Promise<object> => {
    if (!data.email || !data.password) {
        throw new Error('email and password are required');
    }

    return api.fetchAPI('/user/login',
        { method: 'POST', body: JSON.stringify(data) },
        false
    );
};

const me = async (): Promise<object> => {
    return api.fetchAPI('/user/me',
        { method: 'GET' },
        true
    );
}

const logout = async (): Promise<void> => {
    api.removeToken();
}

const isLoggedIn = (): boolean => {
    return !!api.getToken();
}

const getSub = (): string | null => {
    const token = api.getToken();
    if (!token) {
        return null;
    }

    return api.getToken() ? JSON.parse(atob(token.split('.')[1])).sub : null;
}

const methods = {
    ...crudAPI,
    login,
    logout,
    isLoggedIn,
    me,
    getSub
} as UseUsers; 

export function useUser(): UseUsers {
    return methods;
}
