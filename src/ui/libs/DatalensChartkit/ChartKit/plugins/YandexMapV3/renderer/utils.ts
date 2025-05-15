import * as turf from '@turf/circle';
import type {LngLat, LngLatBounds, PolygonGeometry} from '@yandex/ymaps3-types';

import type {SingleItem, YandexMapWidgetData} from '../types';

import {DEFAULT_CENTER, DEFAULT_ZOOM} from './constants';
import type {YMapConfig, YMapFeature, YMapPoint} from './types';

function reverseCoordinates(data: unknown): LngLat | LngLat[] {
    if (Array.isArray(data)) {
        if (Array.isArray(data[0])) {
            return data.map(reverseCoordinates) as LngLat[];
        }

        return [...data].reverse();
    }

    return data as LngLat;
}

function getCircleGeoJSON(center: LngLat, radiusMeters: number): PolygonGeometry {
    const {geometry} = turf.circle(center as number[], radiusMeters, {units: 'meters'});
    return geometry as PolygonGeometry;
}

function getMapObject(item: SingleItem) {
    switch (item.feature.geometry.type) {
        case 'Circle': {
            const center = reverseCoordinates(item.feature.geometry.coordinates);
            return {
                geometry: getCircleGeoJSON(center as LngLat, item.feature.geometry.radius),
                style: {
                    simplificationRate: 0,
                    fill: item.options?.fillColor,
                    fillOpacity: item.options?.opacity,
                },
                properties: getMapOpjectProperties(item),
            };
        }
        case 'Rectangle': {
            const [[left, bottom], [right, top]] = item.feature.geometry.coordinates;
            return {
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [bottom, left],
                            [top, left],
                            [top, right],
                            [bottom, right],
                        ],
                    ],
                },
                style: {
                    simplificationRate: 0,
                    fill: item.options?.fillColor,
                    fillOpacity: item.options?.opacity,
                },
                properties: getMapOpjectProperties(item),
            };
        }
        case 'LineString':
        case 'Polygon': {
            return {
                geometry: {
                    ...item.feature.geometry,
                    coordinates: reverseCoordinates(item.feature.geometry.coordinates),
                },
                style: {
                    stroke: [
                        {
                            width: item.options?.strokeWidth,
                        },
                    ],
                },
                properties: getMapOpjectProperties(item),
            };
        }
        default: {
            return null;
        }
    }
}

function getMapOpjectProperties(item: SingleItem) {
    const props = item.feature.properties ?? {};
    const result: Record<string, unknown> = {};

    if (['name', 'value', 'text', 'data'].some((field) => field in props)) {
        result.hint = item.feature.properties;
    }

    return result;
}

function getPointObject(item: SingleItem): YMapPoint {
    const iconColor = item.options.iconColor ?? '';
    return {
        coordinates: reverseCoordinates(item.feature.geometry.coordinates) as LngLat,
        properties: getMapOpjectProperties(item),
        color: iconColor,
        zIndex: item.options.zIndex,
        radius: Number(item.feature.properties?.radius ?? 2),
    };
}

export function getMapConfig(args: YandexMapWidgetData): YMapConfig {
    const {data: originalData = [], libraryConfig} = args;
    const center = reverseCoordinates(libraryConfig?.state?.center ?? DEFAULT_CENTER) as LngLat;
    const zoom = libraryConfig?.state?.zoom ?? DEFAULT_ZOOM;
    const bounds = reverseCoordinates(libraryConfig?.state?.bounds) as LngLatBounds;

    return {
        location: {
            center,
            zoom,
            bounds,
        },
        behaviors: libraryConfig?.state?.behaviors,
        controls: libraryConfig?.state?.controls ?? ['zoomControl'],
        layers: originalData.map((item) => {
            const points = [];
            const clusteredPoints: any[] = [];
            const features: YMapFeature[] = [];

            if ('feature' in item && item.feature.geometry.type === 'Point') {
                points.push(getPointObject(item));
            }

            if ('collection' in item) {
                item.collection.children.forEach((d) => {
                    if (d.feature.geometry.type === 'Point') {
                        points.push(getPointObject(d));
                    }
                });
            }

            if ('clusterer' in item) {
                item.clusterer.forEach((d) => {
                    if (d.feature.geometry.type === 'Point') {
                        clusteredPoints.push(getPointObject(d));
                    }
                });
            }

            if ('feature' in item) {
                const mapObject = getMapObject(item);
                if (mapObject) {
                    features.push(mapObject);
                }
            }

            if ('collection' in item) {
                item.collection.children.forEach((d) => {
                    const mapObject = getMapObject(d);
                    if (mapObject) {
                        features.push(mapObject);
                    }
                });
            }

            return {
                opacity: item.options.opacity,
                points,
                clusteredPoints,
                features,
            };
        }),
    };
}
