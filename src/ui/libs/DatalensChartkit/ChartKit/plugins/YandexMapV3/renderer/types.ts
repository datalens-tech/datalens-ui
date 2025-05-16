import type {
    BehaviorType,
    DrawingStyle,
    GenericGeometry,
    LngLat,
    YMapLocationRequest,
} from '@yandex/ymaps3-types';

import type {YandexMapControlType} from '../types';

export type YMapPoint = {
    coordinates: LngLat;
    properties?: Record<string, unknown>;
    color?: string;
    zIndex?: number;
    radius?: number;
};

export type YMapFeature = {
    geometry: GenericGeometry<LngLat>;
    style?: DrawingStyle;
    properties?: Record<string, unknown>;
};

export type YMapLayerConfig = {
    opacity?: number;
    features: YMapFeature[];
    points: YMapPoint[];
    clusteredPoints: YMapPoint[];
};

export type YMapConfig = {
    location: YMapLocationRequest;
    behaviors?: BehaviorType[];
    controls?: YandexMapControlType[];
    layers: YMapLayerConfig[];
};
