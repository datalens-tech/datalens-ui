import type {ChartKitOnLoadData, ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';
import type {StringParams} from '@gravity-ui/chartkit/highcharts';
import type {BehaviorType, LngLat, LngLatBounds} from '@yandex/ymaps3-types';
import type {Language} from 'shared';

import type {OnChangeData} from '../../../types';

type GeometryCircle = {
    type: 'Circle';
    coordinates: [number, number];
    radius: number;
};

type GeometryRectangle = {
    type: 'Rectangle';
    coordinates: [number, number][];
};

type GeometryPolyline = {
    type: 'LineString';
    coordinates: [number, number][];
};

type GeometryPolygon = {
    type: 'Polygon';
    coordinates: [number, number][][];
};

type Point = {
    type: 'Point';
    coordinates: [number, number];
};

type YmapItemOptions = {
    fillColor?: string;
    opacity?: number;
    strokeWidth?: number;
};

type GeometryType = GeometryCircle | GeometryRectangle | GeometryPolygon | GeometryPolyline | Point;

export type SingleItem = {
    feature: {
        geometry: GeometryType;
        properties?: Record<string, unknown>;
    };
    options: YmapItemOptions;
};

type ItemCollection = {
    collection: {
        children: SingleItem[];
    };
    options: YmapItemOptions;
};

type ItemClusterer = {
    clusterer: SingleItem[];
    options: YmapItemOptions;
};

export type YandexMapWidgetDataItem = SingleItem | ItemCollection | ItemClusterer;

export type YandexMapControlType = 'zoomControl' | 'scaleControl';

export type YandexMapWidgetData = {
    data?: YandexMapWidgetDataItem[];
    config?: Record<string, unknown>;
    libraryConfig?: {
        apiKey?: string;
        state?: {
            center?: LngLat;
            zoom?: number;
            controls: YandexMapControlType[];
            behaviors?: BehaviorType[];
            bounds?: LngLatBounds;
        };
        options?: Record<string, unknown>;
    };
    unresolvedParams?: StringParams;
};

export type YandexMapWidgetProps = {
    id: string;
    data: YandexMapWidgetData;
    lang: Language;
    splitTooltip?: boolean;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onLoad?: (
        data?: ChartKitOnLoadData<'yandexmap'> & {yandexMapAPIWaiting?: number | null},
    ) => void;
} & Pick<ChartKitProps<ChartKitType>, 'onRender' | 'onChartLoad'>;
