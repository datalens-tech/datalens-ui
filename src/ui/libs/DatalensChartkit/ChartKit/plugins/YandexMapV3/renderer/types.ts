import type {MarkerColorProps} from '@yandex/ymaps3-default-ui-theme';
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
    color?: MarkerColorProps;
    zIndex?: number;
};

export type YMapConfig = {
    location: YMapLocationRequest;
    features: {
        geometry: GenericGeometry<LngLat>;
        style?: DrawingStyle;
        properties?: Record<string, unknown>;
    }[];
    points: YMapPoint[];
    clusteredPoints: any[];
    behaviors?: BehaviorType[];
    controls?: YandexMapControlType[];
};
