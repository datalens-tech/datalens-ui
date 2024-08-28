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

type EventManager = {
    events: {
        add: (eventName: string, cb: (event: unknown) => void) => void;
    };
};

type GeoObjectCollection<T> = {
    toArray: () => T[];
} & EventManager;

export type GeoPoint = GeoObject<GeoPointProperties, {active?: boolean}>;
export type GeoPointCollection = GeoObjectCollection<GeoPoint>;

export type GeoPolygon = {
    geometry: {
        type?: string;
    };
    properties: {
        custom?: {
            actionParams?: StringParams;
        };
    };
    options: {
        fillOpacity?: number;
    };
};

export type GeoPolygonCollection = GeoObject<unknown, unknown> & EventManager;

export type GeoPointData = {
    feature?: {
        properties?: GeoPointProperties;
    };
    options: {
        active?: boolean;
    };
};
