import z from 'zod/v4';

import {editorChartSchema} from '../../us/schemas/editor';

export const deleteEditorChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteEditorChartResultSchema = z.object({});

export const getEditorChartArgsSchema = z.object({
    chartId: z.string(),
    workbookId: z.union([z.string(), z.null()]).optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    includeFavorite: z.boolean().optional(),
    branch: z.literal(['saved', 'published']).optional(),
});

export const getEditorChartResultSchema = editorChartSchema;
