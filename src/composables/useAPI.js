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
            if (debug) console.error(response);
            throw new Error(response.statusText);
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
        _findAll: true,
        _findOne: true,
        _new: false,
        _create: true,
        _update: true,
        _delete: true
    }) => {
        const api = {}

        api._findAll = async (page = 1, limit = 10) => {
            return fetchAPI(`/${plural}?page=${page}&limit=${limit}`,
                { method: 'GET' },
                auth._findAll
            );
        };

        api._findOne = async (id) => {
            return fetchAPI(`/${singular}/${id}`,
                { method: 'GET' },
                auth._findOne
            );
        };

        api._new = async () => {
            return fetchAPI(`/${singular}/new`,
                { method: 'GET' },
                auth._new
            );
        };

        api._create = async (data) => {
            data.uuid = uuidv4();

            return fetchAPI(`/${singular}`,
                { method: 'POST', body: JSON.stringify(data) },
                auth._create
            );
        };

        api._update = async (id, data) => {
            return fetchAPI(`/${singular}/${id}`,
                { method: 'PUT', body: JSON.stringify(data) },
                auth._update
            );
        }

        api._delete = async (id) => {
            return fetchAPI(`/${singular}/${id}`,
                { method: 'DELETE' },
                auth._delete
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
