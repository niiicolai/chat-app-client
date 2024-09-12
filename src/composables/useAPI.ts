import { v4 as uuidv4 } from 'uuid';

const URL = import.meta.env.VITE_API_URL;
const localStorageKey = import.meta.env.VITE_API_LOCAL_STORAGE_KEY;
const debug = import.meta.env.VITE_API_DEBUG;

interface APIOptions {
    method: string;
    headers?: HeadersInit;
    body?: BodyInit;
}

interface AuthOptions {
    findAll: Boolean;
    findOne: Boolean;
    template: Boolean;
    create: Boolean;
    update: Boolean;
    delete: Boolean;
}
export interface CrudAPI {
    findAll: (options: any) => Promise<object>;
    findOne: (id: string) => Promise<object>;
    template: () => Promise<object>;
    create: (data: any, form: any) => Promise<object>;
    update: (id: string, data: any, form: any) => Promise<object>;
    delete: (id: string) => Promise<object>;
}

interface API {
    fetchAPI: (endpoint: string, options: APIOptions, useAuth: Boolean) => Promise<object>;
    crudAPI: (singular: string, plural: string, auth: AuthOptions) => CrudAPI;
    removeToken: () => void;
    getToken: () => string | null;
}

export function useAPI(): API {
    const fetchAPI = async (endpoint: string, options: APIOptions, useAuth: Boolean): Promise<object> => {
        let token: string | null = null;
        if (useAuth) token = localStorage.getItem(localStorageKey);
        if (useAuth && !token) throw new Error('No token found in local storage');

        const response = await fetch(`${URL}${endpoint}`,
            {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(useAuth && { 'Authorization': `Bearer ${token}` }),
                    ...options.headers
                }
            }
        );

        if (!response.ok) {
            const res = await response.json();
            const msg = `Error: ${res.error || response.statusText}`;            
            if (debug) console.error(msg);
            throw new Error(msg);
        }

        const json = await response.json();

        if (json.token) {
            localStorage.setItem(localStorageKey, json.token);
        }

        return json;
    };

    const removeToken = () => {
        localStorage.removeItem(localStorageKey);
    };

    const getToken = () => {
        return localStorage.getItem(localStorageKey);
    }

    const crudAPI = (singular: string, plural: string, auth: AuthOptions) => {
        const api = {} as CrudAPI;

        api.findAll = async (options={}): Promise<object> => {
            let url = `/${plural}`;
            
            const keys = Object.keys(options);
            if (keys.length > 0) {
                url += '?';
                keys.forEach((key, index) => {
                    url += `${key}=${options[key]}${index < keys.length - 1 ? '&' : ''}`;
                });
            }

            return fetchAPI(url,
                { method: 'GET' },
                auth.findAll
            );
        };

        api.findOne = async (id: string): Promise<object> => {
            return fetchAPI(`/${singular}/${id}`,
                { method: 'GET' },
                auth.findOne
            );
        };

        api.template = async (): Promise<object> => {
            return fetchAPI(`/${singular}/new`,
                { method: 'GET' },
                auth.template
            );
        };

        api.create = async (data: any, form: any): Promise<object> => {
            data.uuid = uuidv4();

            if (form) {
                const formData = new FormData(form);
                const API_URL = import.meta.env.VITE_API_URL;
                const token = localStorage.getItem(import.meta.env.VITE_API_LOCAL_STORAGE_KEY);
                const response = await fetch(`${API_URL}/${singular}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData
                });

                if (!response.ok) {
                    const res = await response.json();
                    const msg = `Error: ${res.error || response.statusText}`;
                    if (debug) console.error(msg);
                    throw new Error(msg);
                }
                const json = await response.json();
                if (json.token) {
                    localStorage.setItem(localStorageKey, json.token);
                }
                return json;
            }

            return fetchAPI(`/${singular}`,
                { method: 'POST', body: JSON.stringify(data) },
                auth.create
            );
        };

        api.update = async (id: string, data: any, form: any): Promise<object> => {
            if (form) {
                const formData = new FormData(form);
                const API_URL = import.meta.env.VITE_API_URL;
                const token = localStorage.getItem(import.meta.env.VITE_API_LOCAL_STORAGE_KEY);
                const response = await fetch(`${API_URL}/${singular}/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData
                });

                if (!response.ok) {
                    const res = await response.json();
                    const msg = `Error: ${res.error || response.statusText}`;
                    if (debug) console.error(msg);
                    throw new Error(msg);
                }
                return await response.json();
            }

            return fetchAPI(`/${singular}/${id}`,
                { method: 'PATCH', body: JSON.stringify(data) },
                auth.update
            );
        }

        api.delete = async (id: string): Promise<object> => {
            return fetchAPI(`/${singular}/${id}`,
                { method: 'DELETE' },
                auth.delete
            );
        }

        return api;
    }
    
    return { 
        fetchAPI,
        crudAPI,
        removeToken,
        getToken
    };
}
