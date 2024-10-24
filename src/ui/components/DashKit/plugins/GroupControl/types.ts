import type {QueueItem, StateAndParamsMetaData} from '@gravity-ui/dashkit/helpers';
import type {DashTabItemControlSourceType, StringParams, WorkbookId} from 'shared';
import type {ResponseSuccessSingleControl} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';

import type {LoadStatus} from '../Control/types';

export type ContextProps = {
    workbookId?: WorkbookId;
};

export type ExtendedLoadedData = ResponseSuccessSingleControl & {
    id: string;
    sourceType: DashTabItemControlSourceType;
};

export interface PluginGroupControlState {
    status: LoadStatus;
    silentLoading: boolean;
    initialParams?: StringParams;
    isInit: boolean;
    stateParams: Record<string, StringParams>;
    needReload: boolean;
    localUpdateLoader: boolean;
    quickActionLoader: boolean;
    disableButtons?: boolean;
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

export type GroupControlLocalMeta = Omit<StateAndParamsMetaData, 'queue'> & {
    queue: (QueueItem & {param?: string})[];
};
