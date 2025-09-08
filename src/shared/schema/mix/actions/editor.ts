import z from 'zod/v4';

import {EDITOR_TYPE} from '../../../constants';
import {DeveloperModeCheckStatus, EntryScope} from '../../../types';
import {createAction, createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import type {
    CreateEditorChartArgs,
    CreateEditorChartResponse,
    UpdateEditorChartArgs,
    UpdateEditorChartResponse,
} from '../../us/types';
import {getEntryLinks} from '../helpers';
import {validateData} from '../helpers/editor/validation';

const editorUsSchema = z.object({
    data: z.union([
        z.object({
            js: z.string(),
            url: z.string(),
            params: z.string(),
            shared: z.string(),
        }),
        z.object({
            controls: z.string(),
            meta: z.string(),
            params: z.string(),
            prepare: z.string(),
            sources: z.string(),
        }),
    ]),
    entryId: z.string(),
    scope: z.literal(EntryScope.Widget),
    type: z.enum(EDITOR_TYPE),
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

export const editorActions = {
    getEditorChartApi: createTypedAction(
        {
            argsSchema: z.object({
                chardId: z.string(),
                workbookId: z.union([z.string(), z.null()]).default(null).optional(),
                revId: z.string().optional(),
                includePermissions: z.boolean().default(false).optional(),
                includeLinks: z.boolean().default(false).optional(),
                branch: z.literal(['saved', 'published']).default('published').optional(),
            }),
            bodySchema: editorUsSchema,
        },
        async (api, args) => {
            const {includePermissions, includeLinks, revId, chardId, branch, workbookId} = args;
            const typedApi = getTypedApi(api);

            return typedApi.us.getEntry({
                entryId: chardId,
                includePermissionsInfo: includePermissions ? Boolean(includePermissions) : false,
                includeLinks: includeLinks ? Boolean(includeLinks) : false,
                ...(revId ? {revId} : {}),
                workbookId: workbookId || null,
                branch: branch || 'published',
            }) as unknown as z.infer<typeof editorUsSchema>;
        },
    ),
    createEditorChart: createAction<CreateEditorChartResponse, CreateEditorChartArgs>(
        async (api, args, {ctx}) => {
            const {checkRequestForDeveloperModeAccess} = ctx.get('gateway');

            const checkResult = await checkRequestForDeveloperModeAccess({ctx});

            if (checkResult === DeveloperModeCheckStatus.Allowed) {
                validateData(args.data);

                const typedApi = getTypedApi(api);

                return await typedApi.us._createEditorChart({...args, links: getEntryLinks(args)});
            } else {
                throw new Error('Access to Editor developer mode was denied');
            }
        },
    ),
    updateEditorChart: createAction<UpdateEditorChartResponse, UpdateEditorChartArgs>(
        async (api, args, {ctx}) => {
            const {checkRequestForDeveloperModeAccess} = ctx.get('gateway');

            const checkResult = await checkRequestForDeveloperModeAccess({ctx});

            if (checkResult === DeveloperModeCheckStatus.Allowed) {
                validateData(args.data);

                const typedApi = getTypedApi(api);

                return await typedApi.us._updateEditorChart({...args, links: getEntryLinks(args)});
            } else {
                throw new Error('Access to Editor developer mode was denied');
            }
        },
    ),
    deleteEditorChartApi: createTypedAction(
        {
            argsSchema: z.object({
                chartId: z.string(),
            }),
            bodySchema: z.any(),
        },
        async (api, {chartId}) => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: chartId,
            });
        },
    ),
};
