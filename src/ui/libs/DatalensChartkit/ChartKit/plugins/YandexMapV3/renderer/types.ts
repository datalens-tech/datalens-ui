import type {
    DrawingStyle,
    GenericGeometry,
    LngLat,
    YMapLocationRequest,
} from '@yandex/ymaps3-types';

export type YMapConfig = {
    location: YMapLocationRequest;
    features: {
        geometry: GenericGeometry<LngLat>;
        style?: DrawingStyle;
        properties?: Record<string, unknown>;
    }[];
    points: any[];
    clusteredPoints: any[];
};
