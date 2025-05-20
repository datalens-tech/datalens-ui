import type {
    BehaviorType,
    DrawingStyle,
    GenericGeometry,
    LngLat,
    YMapLocationRequest,
} from '@yandex/ymaps3-types';

import type {YandexMapControlType} from '../types';

import type {ClusterFeature} from './components/ymaps3';

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
    id: string;
    opacity?: number;
    features: YMapFeature[];
    points: YMapPoint[];
    clusteredPoints: ClusterFeature[];
};

export type YMapConfig = {
    location: YMapLocationRequest;
    behaviors?: BehaviorType[];
    controls?: YandexMapControlType[];
    layers: YMapLayerConfig[];
};
