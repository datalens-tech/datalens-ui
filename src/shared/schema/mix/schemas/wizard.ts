import z from 'zod/v4';

import {EntryScope, WizardType} from '../../..';
import {v12ChartsConfigSchema} from '../../../sdk/zod-schemas/wizard-chart-api.schema';

export const getWizardChartArgsSchema = z.object({
    chardId: z.string(),
    unreleased: z.boolean().default(false).optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().default(false).optional(),
    includeLinks: z.boolean().default(false).optional(),
});

const wizardUsSchema = z.object({
    data: v12ChartsConfigSchema,
    entryId: z.string(),
    scope: z.literal(EntryScope.Widget),
    type: z.enum(WizardType),
    public: z.boolean(),
    isFavorite: z.boolean(),
    createdAt: z.string(),
    createdBy: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
    revId: z.string(),
    savedId: z.string(),
    publishedId: z.string(),
    meta: z.record(z.string(), z.string()),
    links: z.record(z.string(), z.string()).optional(),
    key: z.union([z.null(), z.string()]),
    workbookId: z.union([z.null(), z.string()]),
});

export const getWizardChartResultSchema = wizardUsSchema;

export const createWizardChartArgsSchema = z.object({
    entryId: z.string(),
    data: v12ChartsConfigSchema,
    key: z.string(),
    workbookId: z.union([z.string(), z.null()]).optional(),
    type: z.enum(WizardType).optional(),
    name: z.string(),
});

export const createWizardChartResultSchema = wizardUsSchema;

export const updateWizardChartArgsSchema = z.object({
    entryId: z.string(),
    revId: z.string().optional(),
    data: v12ChartsConfigSchema,
    type: z.enum(WizardType).optional(),
});

export const updateWizardChartResultSchema = wizardUsSchema;

export const deleteWizardChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteWizardChartResultSchema = z.object({});
