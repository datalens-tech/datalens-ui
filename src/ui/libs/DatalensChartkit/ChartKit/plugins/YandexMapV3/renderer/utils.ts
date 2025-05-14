import * as turf from '@turf/circle';
import type {LngLat, PolygonGeometry} from '@yandex/ymaps3-types';

import type {SingleItem, YandexMapWidgetData} from '../types';

import type {YMapConfig} from './types';

function reverseCoordinates(data: unknown): unknown {
    if (Array.isArray(data)) {
        if (Array.isArray(data[0])) {
            return data.map(reverseCoordinates);
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
                properties: {
                    hint: item.feature.properties,
                },
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
                properties: {
                    hint: item.feature.properties,
                },
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
                properties: {
                    hint: item.feature.properties,
                },
            };
        }
        default: {
            return null;
        }
    }
}

function getPointObject(item: SingleItem) {
    return {
        coordinates: reverseCoordinates(item.feature.geometry.coordinates),
        properties: {
            hint: item.feature.properties,
        },
    };
}

export function getMapConfig(args: YandexMapWidgetData): YMapConfig {
    const {data: originalData = [], libraryConfig} = args;
    const center = reverseCoordinates(libraryConfig?.state?.center);
    const features = originalData.reduce((acc, item) => {
        if ('feature' in item) {
            const mapObject = getMapObject(item);
            if (mapObject) {
                acc.push(mapObject);
            }
        }

        if ('collection' in item) {
            item.collection.children.forEach((d) => {
                const mapObject = getMapObject(d);
                if (mapObject) {
                    acc.push(mapObject);
                }
            });
        }

        return acc;
    }, [] as any[]);

    const points = originalData.reduce((acc, item) => {
        if ('feature' in item && item.feature.geometry.type === 'Point') {
            acc.push(getPointObject(item));
        }

        if ('collection' in item) {
            item.collection.children.forEach((d) => {
                if (d.feature.geometry.type === 'Point') {
                    acc.push(getPointObject(d));
                }
            });
        }

        return acc;
    }, [] as any[]);

    const clusteredPoints = originalData.reduce((acc, item) => {
        if ('clusterer' in item) {
            item.clusterer.forEach((d) => {
                if (d.feature.geometry.type === 'Point') {
                    acc.push(getPointObject(d));
                }
            });
        }

        return acc;
    }, [] as any[]);

    const mapProps: any = {
        location: {
            center,
            zoom: libraryConfig?.state?.zoom ?? 10,
        },
        features,
        points,
        clusteredPoints,
    };

    return mapProps;
}
