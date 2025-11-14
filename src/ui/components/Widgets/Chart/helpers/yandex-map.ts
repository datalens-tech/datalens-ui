import {get} from 'lodash';
import type {LoadedWidgetData} from 'ui/libs/DatalensChartkit/types';

function roundCoordinates(point: number[], precision = 4) {
    return [parseFloat(point[0].toFixed(precision)), parseFloat(point[1].toFixed(precision))];
}

function deltaEncode(coords: number[][], precision = 4) {
    if (coords.length === 0) return [];

    const multiplier = 10 ** precision;
    const result = [];
    let prevLat = 0;
    let prevLng = 0;

    for (const [lat, lng] of coords) {
        const scaledLat = Math.round(lat * multiplier);
        const scaledLng = Math.round(lng * multiplier);

        const deltaLat = scaledLat - prevLat;
        const deltaLng = scaledLng - prevLng;

        if (deltaLat !== 0 || deltaLng !== 0) {
            result.push(deltaLat, deltaLng);
            prevLat = scaledLat;
            prevLng = scaledLng;
        }
    }

    return result;
}

function getLayerSimpleConfig(layerData: any) {
    if ('heatmap' in layerData) {
        return {
            type: 'heatmap',
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            chartAsTable: [
                'Coordinates;PointWeight',
                ...layerData.heatmap.map((d: any) =>
                    [
                        JSON.stringify(roundCoordinates(d.geometry.coordinates)),
                        get(d, 'properties.weight'),
                    ].join(';'),
                ),
            ],
        };
    }

    if ('polygonmap' in layerData) {
        const properties = layerData.polygonmap.polygons.features[0].properties.data.map(
            (d: any) => d.text.split(': ')[0],
        );
        return {
            type: 'polygons',
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            deltaEncode: true,
            chartAsTable: [
                ['Polygons', ...properties].join(';'),
                ...layerData.polygonmap.polygons.features.map((d: any) =>
                    [
                        JSON.stringify(deltaEncode(d.geometry.coordinates[0])),
                        ...d.properties.data.map((d: any) => d.text.split(': ')[1]),
                    ].join(';'),
                ),
            ],
        };
    }

    if ('collection' in layerData) {
        const properties = layerData.collection.children[0].feature.properties.data.map(
            (d: any) => d.text.split(': ')[0],
        );

        return {
            type: 'points',
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            sizeField: layerData.options.sizeTitle,
            chartAsTable: [
                ['Coordinates', ...properties].join(';'),
                ...layerData.collection.children.map((d: any) =>
                    [
                        JSON.stringify(roundCoordinates(d.feature.geometry.coordinates)),
                        ...d.feature.properties.data.map((d: any) => d.text.split(': ')[1]),
                    ].join(';'),
                ),
            ],
        };
    }

    // todo: prepare polylines and clusters
    return layerData;
}

export function getMapSimpleConfig({widgetData}: {widgetData?: LoadedWidgetData}) {
    if (!widgetData) {
        return {};
    }

    const layers: any = widgetData.data ?? [];
    return {
        type: widgetData.type,
        layers: layers.map((d: object) => getLayerSimpleConfig(d)),
        bounds: widgetData.libraryConfig?.state.bounds,
    };
}
