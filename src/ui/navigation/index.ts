export {createBrowserHistory, createHashHistory, createMemoryHistory} from 'history';
export {getHistory, setHistory} from './history';
export {getLocation, getRouter, useLocation, useRouter} from './router';
export type {Target} from './router';

export const toSearchParams = <T extends Record<string, unknown>>(params: T = {} as T) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                searchParams.append(key, String(item));
            });
        } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    return searchParams;
};

export const toQueryString = <T extends Record<string, unknown>>(params: T = {} as T) => {
    const query = String(toSearchParams(params));

    return query.length ? '?' + query : '';
};
