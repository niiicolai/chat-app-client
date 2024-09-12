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

const login = async (data: any): Promise<object> => {
    if (!data.email || !data.password) {
        throw new Error('email and password are required');
    }

    return api.fetchAPI('/login',
        { method: 'POST', body: JSON.stringify(data) },
        false
    );
};

const me = async (): Promise<object> => {
    return api.fetchAPI('/me',
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
