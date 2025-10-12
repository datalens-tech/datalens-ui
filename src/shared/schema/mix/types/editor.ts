import type {EntryScope} from '../../../../shared';

export type GetEditorChartArgs = {
    chartId: string;
    workbookId?: string | null;
    revId?: string;
    includePermissionsInfo?: boolean;
    includeLinks?: boolean;
    includeFavorite?: boolean;
    branch?: 'saved' | 'published';
};

export type BaseEntry = {
    entryId: string;
    key: string | null;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    revId: string;
    savedId: string;
    publishedId: string | null;
    tenantId: string;
    hidden: boolean;
    public: boolean;
    workbookId: string | null;
};

export type EditorChart = BaseEntry & {
    scope: EntryScope.Widget;
    type: string;
    meta: Record<string, unknown> | null;
    data: Record<string, unknown> | null;
    links?: Record<string, string> | null;
    annotation?: {
        description?: string;
    } | null;
};

export type GetEditorChartResponse = EditorChart;
