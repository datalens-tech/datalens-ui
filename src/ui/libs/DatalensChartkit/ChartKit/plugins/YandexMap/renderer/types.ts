import type {StringParams} from 'shared';

export type GeoPointProperties = {
    custom?: {
        actionParams?: StringParams;
    };
};

type DataManager<T> = {
    get: (key: keyof T) => T[keyof T];
    set: (key: keyof T, value: T[keyof T]) => void;
};

type GeoObject<P, O> = {
    properties: DataManager<P>;
    options: DataManager<O>;
};

type GeoObjectCollection<T> = {
    toArray: () => T[];
    events: {
        remove: (eventName: string) => void;
        add: (eventName: string, cb: (event: unknown) => void) => void;
    };
};

export type GeoPoint = GeoObject<GeoPointProperties, {active?: boolean}>;
export type GeoPointCollection = GeoObjectCollection<GeoPoint>;
