import type {WizardVisualizationId} from '../../../constants';
import type {ChartsStats, DashStats, WorkbookId} from '../../../types';
import type {GetEntriesEntryResponse} from '../../us/types';

export enum StatsRequestStatus {
    Success = 'success',
    Error = 'error',
}

export type CollectDashStatsResponse = {
    status: StatsRequestStatus;
};

export type CollectDashStatsArgs = DashStats;

export type CollectChartkitStatsResponse = {
    status: StatsRequestStatus;
    rowsCount?: number;
};

export type CollectChartkitStatsArgs = ChartsStats[];

export type GetEntriesDatasetsFieldsListItem = {
    title: string;
    guid: string;
    dataType?: string;
    type?: string;
};

export type GetEntriesDatasetsFieldsItem = {
    entryId: string;
    type: GetEntriesEntryResponse['type'] | null;
    visualizationType?: WizardVisualizationId;
    datasetId?: string;
    datasetName?: string;
    datasetFields?: GetEntriesDatasetsFieldsListItem[];
};

export type GetEntriesDatasetsFieldsResponse = GetEntriesDatasetsFieldsItem[];

export type GetEntriesDatasetsFieldsArgs = {
    entriesIds: string[];
    datasetsIds: string[];
    workbookId: WorkbookId;
};

export type GetWidgetsDatasetsFieldsItem = {
    entryId: string;
    datasetId?: string;
    datasetFields?: string[];
};

export type GetWidgetsDatasetsFieldsResponse = GetWidgetsDatasetsFieldsItem[];

export type GetWidgetsDatasetsFieldsArgs = {
    entriesIds: string[];
    workbookId: WorkbookId;
};
