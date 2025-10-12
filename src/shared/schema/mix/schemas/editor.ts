import {z} from 'zod';

import {registerOpenApiComponent} from '../../../../server/components/public-api/utils/zod-open-api';
import {EntryScope} from '../../../../shared';

export const getEditorChartParamsSchema = z.strictObject({
    chartId: z.string(),
    workbookId: z.union([z.string(), z.null()]).optional(),
    revId: z.string().optional(),
    includePermissionsInfo: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    includeFavorite: z.boolean().optional(),
    branch: z.literal(['saved', 'published']).optional(),
});

// Common entry
export const baseEntrySchema = z.object({
    entryId: z.string(),
    key: z.union([z.null(), z.string()]),
    createdAt: z.string(),
    createdBy: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
    revId: z.string(),
    savedId: z.string(),
    publishedId: z.string().nullable(),
    tenantId: z.string(),
    hidden: z.boolean(),
    public: z.boolean(),
    workbookId: z.union([z.null(), z.string()]),
});

// Editor entry
export const baseEditorChartSchema = baseEntrySchema.extend({
    scope: z.literal(EntryScope.Widget),
    meta: z.record(z.string(), z.unknown()).nullable(),
    links: z.record(z.string(), z.string()).nullable().optional(),
    annotation: z
        .object({
            description: z.string().optional(),
        })
        .nullable()
        .optional(),
});

export const gravityChartSchema = registerOpenApiComponent(
    'EditorGravityChart',
    baseEditorChartSchema.extend({
        type: z.literal('gravity_charts_node'),
        data: z.object({
            meta: z.string(),
            params: z.string(),
            sources: z.string(),
            config: z.string(),
            prepare: z.string(),
            controls: z.string(),
        }),
    }),
);

export const advancedChartSchema = registerOpenApiComponent(
    'EditorAdvancedChart',
    baseEditorChartSchema.extend({
        type: z.literal('advanced_chart_node'),
        data: z.object({
            meta: z.string(),
            params: z.string(),
            sources: z.string(),
            prepare: z.string(),
            controls: z.string(),
        }),
    }),
);

export const editorChartTypes = [gravityChartSchema, advancedChartSchema] as const;

export const editorChartSchema = registerOpenApiComponent(
    'EditorChart',
    z.discriminatedUnion('type', editorChartTypes),
);

export const getEditorChartResultSchema = editorChartSchema;
