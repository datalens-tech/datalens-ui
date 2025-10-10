import type {DashTabItemControlSourceType, DashTabItemType, StringParams} from 'shared';

import type {Widget} from '../../../../ui/libs/DatalensChartkit/types/widget';
import type {DASH_WIDGET_TYPES} from '../../../units/dash/modules/constants';

import type {WidgetLoadedData} from './../../Widgets/Chart/helpers/helpers';

export type DashkitMetaDataItemBase = {
    layoutId: string;
    widgetId: string;
    chartId: string | null;
    entryId: string | null; // used for built in widget charts
    itemId?: string; // for widgets with multiple entities
    title: string;
    label?: string;
    params: Array<StringParams> | StringParams;
    defaultParams: Array<StringParams> | StringParams;
    widgetParams?: StringParams;
    loaded: boolean;
    usedParams: Array<string> | null;
    type: DashTabItemType | typeof DASH_WIDGET_TYPES;
    sourceType?: DashTabItemControlSourceType;
    visualizationType: string | null;
    loadError?: boolean;
    datasets?: Array<DatasetsData> | null;
    datasetId?: string;
    datasetFields?: Record<string, string>;
    enableFiltering?: boolean;
    isWizard?: boolean;
    isEditor?: boolean;
    isQL?: boolean;
    getSimpleLoadedData?: () => WidgetLoadedData | Widget['data'] | string[];
};

export type DatasetsData = {
    id: string;
    fieldsList: Array<DatasetsFieldsListData>;
    name?: string;
    fields: Record<string, string>;
};

export type DatasetsFieldsListData = {
    title: string;
    guid: string;
    dataType?: string;
};
