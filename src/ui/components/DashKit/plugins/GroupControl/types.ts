import type {DashTabItemControlSourceType, StringParams, WorkbookId} from 'shared';
import type {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import {Control} from 'ui/libs/DatalensChartkit/types';

import {LoadStatus} from '../Control/types';

export type ContextProps = {
    workbookId?: WorkbookId;
};

export type ExtendedLoadedData = ResponseSuccessControls & {
    uiScheme: {controls: Control[]};
    id: string;
    sourceType: DashTabItemControlSourceType;
};

export interface PluginGroupControlState {
    status: LoadStatus;
    silentLoading: boolean;
    initialParams?: StringParams;
    isInit: boolean;
    stateParams: StringParams;
    needReload: boolean;
    needMeta: boolean;
    forceUpdate: boolean;
}

export type ResolveMetaResult = {
    id: string;
    usedParams?: string[] | null;
    datasets?: ExtendedLoadedData['extra']['datasets'];
    datasetId?: string;
    datasetFields?: Record<string, string>;
    type?: string;
    sourceType?: DashTabItemControlSourceType;
};
