import {get} from 'lodash';
import type {LoadedWidgetData} from 'ui/libs/DatalensChartkit/types';

function getLayerSimpleConfig(layerData: any) {
    if ('heatmap' in layerData) {
        return {
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            points: layerData.heatmap.map((d: any) => ({
                coords: get(d, 'geometry.coordinates'),
                weight: get(d, 'properties.weight'),
            })),
        };
    }

    if ('polygonmap' in layerData) {
        return {
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            polygons: layerData.polygonmap.polygons.features.map((d: any) => ({
                coords: get(d, 'geometry.coordinates'),
                data: get(d, 'properties.data'),
            })),
        };
    }

    if ('collection' in layerData) {
        return {
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            sizeField: layerData.options.sizeTitle,
            points: layerData.collection.children.map((d: any) => ({
                coords: get(d, 'feature.geometry.coordinates'),
                data: get(d, 'feature.properties.data'),
            })),
        };
    }

    return {};
}

export function getMapSimpleConfig({widgetData}: {widgetData?: LoadedWidgetData}) {
    if (!widgetData) {
        return {};
    }

    const layers: any = widgetData.data ?? [];
    return {
        type: widgetData.type,
        layers: layers.map((d: object) => getLayerSimpleConfig(d)),
        center: widgetData.libraryConfig?.state.center,
        bounds: widgetData.libraryConfig?.state.bounds,
    };
}
