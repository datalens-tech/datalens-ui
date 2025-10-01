import z from 'zod/v4';

import {editorChartSchema} from '../../us/schemas/editor';

export const deleteEditorChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteEditorChartResultSchema = z.object({});

export const getEditorChartArgsSchema = z.object({
    chartId: z.string(),
    workbookId: z.union([z.string(), z.null()]).default(null).optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().default(false).optional(),
    includeLinks: z.boolean().default(false).optional(),
    includeFavorite: z.boolean().default(false).optional(),
    branch: z.literal(['saved', 'published']).default('published').optional(),
});

export const getEditorChartResultSchema = editorChartSchema;
