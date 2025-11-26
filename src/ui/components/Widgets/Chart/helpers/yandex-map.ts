import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import type {LoadedWidgetData} from 'ui/libs/DatalensChartkit/types';

function getLayerSimpleConfig(layerData: any) {
    if ('heatmap' in layerData) {
        return {
            type: 'heatmap',
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
        };
    }

    if ('polygonmap' in layerData) {
        const properties = layerData.polygonmap.polygons.features[0]?.properties.data?.map(
            (d: any) => d.text.split(':')[0]?.trim(),
        );
        const data = isEmpty(properties)
            ? undefined
            : [
                  [...properties].join(';'),
                  ...layerData.polygonmap.polygons.features.map((d: any) =>
                      d.properties.data?.map((d: any) => d.text.split(':')[1]?.trim()).join(';'),
                  ),
              ];
        return {
            type: 'polygons',
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            data,
        };
    }

    if ('collection' in layerData) {
        const items = layerData.collection.children ?? [];
        if (isEmpty(items)) {
            return {};
        }

        const layerType = items[0].feature.geometry.type;
        const properties = items[0].feature.properties.data?.map((d: any) =>
            d.text.split(':')[0]?.trim(),
        );
        const data = isEmpty(properties)
            ? undefined
            : [
                  [...properties].join(';'),
                  ...items.map((d: any) =>
                      d.feature.properties.data
                          ?.map((d: any) => d.text.split(':')[1]?.trim() ?? '')
                          .join(';'),
                  ),
              ];

        return {
            type: layerType,
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            sizeField: layerData.options.sizeTitle,
            data,
        };
    }

    if ('clusterer' in layerData) {
        const properties = layerData.clusterer[0]?.feature.properties.data?.map((d: any) =>
            d.text.split(':')[0]?.trim(),
        );
        const data = isEmpty(properties)
            ? undefined
            : [
                  [...properties].join(';'),
                  ...layerData.clusterer.map((d: any) =>
                      d.feature.properties.data
                          ?.map((d: any) => d.text.split(':')[1]?.trim() ?? '')
                          .join(';'),
                  ),
              ];

        return {
            type: 'points',
            title: layerData.options.layerTitle,
            colorField: layerData.options.colorTitle,
            sizeField: layerData.options.sizeTitle,
            data,
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
        bounds: get(widgetData, 'libraryConfig.state.bounds'),
    };
}
