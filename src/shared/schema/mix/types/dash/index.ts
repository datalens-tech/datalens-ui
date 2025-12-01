import type z from 'zod';

import type {WizardVisualizationId} from '../../../../constants';
import type {ChartsStats, DashStats, WorkbookId} from '../../../../types';
import type {GetEntriesEntryResponse} from '../../../us/types';
import type {createDashV1ResultSchema} from '../../schemas/dash/create-dashboard-v1';
import type {dashSchemaV1} from '../../schemas/dash/dash-v1';
import type {deleteDashResultSchema} from '../../schemas/dash/delete-dashboard';
import type {getDashV1ResultSchema} from '../../schemas/dash/get-dashboard-v1';
import type {updateDashV1ResultSchema} from '../../schemas/dash/update-dashboard-v1';

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

export type UpdateDashV1Result = z.infer<typeof updateDashV1ResultSchema>;

export type CreateDashV1Result = z.infer<typeof createDashV1ResultSchema>;

export type DeleteDashResult = z.infer<typeof deleteDashResultSchema>;

export type GetDashV1Result = z.infer<typeof getDashV1ResultSchema>;

export type DashV1 = z.infer<typeof dashSchemaV1>;
