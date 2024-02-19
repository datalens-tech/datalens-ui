import {DashTabItemControlSourceType, DashTabItemType, StringParams} from 'shared';

import {DASH_WIDGET_TYPES} from '../../../units/dash/modules/constants';

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
};

// Create new temporary type, Because the types of meta information of the plugin of the current implementation and the new one are slightly different.
export type DashkitOldMetaDataItemBase = Partial<
    Pick<
        DashkitMetaDataItemBase,
        | 'layoutId'
        | 'widgetId'
        | 'entryId'
        | 'title'
        | 'label'
        | 'params'
        | 'defaultParams'
        | 'loaded'
        | 'usedParams'
        | 'type'
        | 'visualizationType'
        | 'loadError'
        | 'datasets'
        | 'datasetId'
        | 'datasetFields'
        | 'enableFiltering'
    > & {
        id: string;
        usedDatasetsId?: string;
    }
>;

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
