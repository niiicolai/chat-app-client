import { v4 as uuidv4 } from 'uuid';

const URL = import.meta.env.VITE_API_URL;
const localStorageKey = import.meta.env.VITE_API_LOCAL_STORAGE_KEY;
const debug = import.meta.env.VITE_API_DEBUG;

export function useAPI() {
    const fetchAPI = async (endpoint, options, useAuth = false) => {
        let token = null;
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

    // Build a CRUD API
    const crudAPI = (singular, plural, auth={
        findAll: true,
        findOne: true,
        template: false,
        create: true,
        update: true,
        delete: true
    }) => {
        const api = {}

        api.findAll = async (options={}) => {
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

        api.findOne = async (id) => {
            return fetchAPI(`/${singular}/${id}`,
                { method: 'GET' },
                auth.findOne
            );
        };

        api.template = async () => {
            return fetchAPI(`/${singular}/new`,
                { method: 'GET' },
                auth.template
            );
        };

        api.create = async (data) => {
            data.uuid = uuidv4();

            return fetchAPI(`/${singular}`,
                { method: 'POST', body: JSON.stringify(data) },
                auth.create
            );
        };

        api.update = async (id, data) => {
            return fetchAPI(`/${singular}/${id}`,
                { method: 'PATCH', body: JSON.stringify(data) },
                auth.update
            );
        }

        api.delete = async (id) => {
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
