import type z from 'zod';

import type {WizardVisualizationId} from '../../../constants';
import type {ChartsStats, DashStats, WorkbookId} from '../../../types';
import type {GetEntriesEntryResponse} from '../../us/types';
import type {createDashResultSchema, updateDashResultSchema} from '../schemas/dash';

export type CollectDashStatsResponse = {
    status: string;
};

export type CollectDashStatsArgs = DashStats;

export type CollectChartkitStatsResponse = {
    status: string;
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

export type UpdateDashResponse = z.infer<typeof updateDashResultSchema>;

export type CreateDashResponse = z.infer<typeof createDashResultSchema>;
