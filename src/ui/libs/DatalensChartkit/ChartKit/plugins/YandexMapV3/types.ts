import type {ChartKitOnLoadData, ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';
import type {Language} from 'shared';

import type {OnChangeData} from '../../../types';
import {StringParams} from '@gravity-ui/chartkit/highcharts';

type GeometryCircle = {
    type: 'Circle';
    coordinates: [number, number];
    radius: number;
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

export type YandexMapWidgetDataItem = {
    feature: {
        geometry: GeometryCircle | GeometryPolygon | GeometryPolyline | Point;
    };
    options: {
        fillColor?: string;
        opacity?: number;
        strokeWidth?: number;
    };
}[];

export type YandexMapWidgetData = {
    data?: YandexMapWidgetDataItem;
    config?: Record<string, unknown>;
    libraryConfig?: {
        apiKey?: string;
        state?: Record<string, unknown>;
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
