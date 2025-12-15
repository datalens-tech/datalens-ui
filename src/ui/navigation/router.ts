import {useMemo} from 'react';

import type {
    History,
    Location,
    LocationState,
    LocationDescriptorObject as _LocationDescriptorObject,
} from 'history';
import {useLocation as _useLocation, useHistory} from 'react-router-dom';

import {getHistory} from './history';

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const getCurrent = (history: History): Location => ({...history.location});

export type LocationDescriptor<S = LocationState> = History.Path | LocationDescriptorObject<S>;
export interface LocationDescriptorObject<S = LocationState>
    extends Omit<_LocationDescriptorObject<S>, 'search'> {
    search?: History.Search | URLSearchParams;
}

const prepareSearch = (search: string) => (search.startsWith('?') ? search : `?${search}`);
const prepareLocation = (history: History, location: LocationDescriptor) => {
    const {search, ...next} = isObject(location) ? location : {pathname: location};

    return {
        ...(next.pathname === undefined && getCurrent(history)),
        ...next,
        ...(search && {
            search: prepareSearch(isObject(search) ? search.toString() : search),
        }),
    };
};

export type Target = '_blank' | '_self' | '_parent' | '_top' | '_unfencedTop';

export type RouterLocation<S = LocationState> = Location<S> & {
    href: string;
    path: string[];
    params(): URLSearchParams;
    url(): URL;
};

/** Uses react-router-dom's history for navigation. */
export interface Router {
    /** History object used by the router */
    readonly history: History;
    /** Similar to `history.createHref`, but creates URL object instead. */
    createUrl(location: Exclude<History.LocationDescriptor, History.Path>): URL;
    location<S = LocationState>(): RouterLocation<S>;
    /** Same as `history.go` */
    go(n: number): void;
    /** Same as `history.goBack` */
    goBack(): void;
    /** Same as `history.goForward` */
    goForward(): void;
    /**
     * Uses window.assign if no features are specified and the target is not `_blank`, otherwise window.open.
     * Reloads the page if the target is `_self`.
     * @param location
     * @param {Target} target Same as window.open target, but defaults to `_self`
     * @param features Same as window.open features
     */
    open(location: LocationDescriptor, target?: Target, features?: string): void;
    /**
     * Same as window.open, but the target is always `_blank`
     * @param location
     * @param features
     */
    openTab(location: LocationDescriptor, features?: string): void;
    /**
     * Same as `history.push`, but augments the current location if no pathname was provided
     * @param location
     */
    push(location: LocationDescriptor): void;
    /**
     * Same as `history.replace`, but augments the current location if no pathname was provided
     * @param location
     */
    replace(location: LocationDescriptor): void;
    /**
     * Same as window.location.reload, but does not throw an error if the window is not defined.
     */
    reload(): void;
}

const createRouterLocation = <T extends Exclude<History.LocationDescriptor, History.Path>>(
    history: History,
    location: T,
) => {
    const href = history.createHref(location);
    const pathname = location.pathname ?? '';

    return {
        ...location,
        href,
        path: pathname.split('/').filter(Boolean),
        params: () => new URLSearchParams(location.search),
        url: () => new URL(href),
    };
};

const createRouter = (history: History): Router => ({
    get history(): History {
        return history;
    },

    createUrl: (location: Exclude<History.LocationDescriptor, History.Path>) =>
        new URL(history.createHref(location)),

    location: <S = LocationState>() => {
        return createRouterLocation(history, getCurrent(history) as Location<S>);
    },
    go: (n: number) => history.go(n),
    goBack: () => history.goBack(),
    goForward: () => history.goForward(),
    open: (location: LocationDescriptor, target: Target = '_self', features = '') => {
        if (typeof window === 'undefined') return;

        const url = history.createHref(prepareLocation(history, location));
        if (target === '_self' && !features) {
            window.location.assign(url);
        } else {
            window.open(url, target, features);
        }
    },
    openTab: (location: LocationDescriptor, features = '') => {
        if (typeof window === 'undefined') return;

        const url = history.createHref(prepareLocation(history, location));

        window.open(url, '_blank', features);
    },
    push: (location: LocationDescriptor) => history.push(prepareLocation(history, location)),
    replace: (location: LocationDescriptor) => history.replace(prepareLocation(history, location)),
    reload: () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    },
});

export const getRouter = (): Router => createRouter(getHistory());
export const useRouter = (): Router => {
    const history = useHistory();

    return useMemo(() => createRouter(history), [history]);
};

export const getLocation = <S = LocationState>() => getRouter().location<S>();
export const useLocation = <S = LocationState>(): RouterLocation<S> => {
    const router = useRouter();
    const location = _useLocation<S>();

    return useMemo(() => createRouterLocation(router.history, location), [router, location]);
};
