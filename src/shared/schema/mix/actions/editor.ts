import {ENTRY_TYPES, EntryScope} from '../../..';
import {DeveloperModeCheckStatus} from '../../../types';
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
import {
    deleteEditorChartArgsSchema,
    deleteEditorChartResultSchema,
    getEditorChartArgsSchema,
    getEditorChartResultSchema,
} from '../schemas/editor';
import {convertGetEntryResponseToGetEditorChartResponse} from '../utils/editor';

export const editorActions = {
    // WIP
    __getEditorChart__: createTypedAction(
        {
            paramsSchema: getEditorChartArgsSchema,
            resultSchema: getEditorChartResultSchema,
        },
        async (api, args) => {
            const {
                includePermissions,
                includeLinks,
                includeFavorite = false,
                revId,
                chartId,
                branch,
                workbookId,
            } = args;

            const typedApi = getTypedApi(api);

            const getEntryResponse = await typedApi.us.getEntry({
                entryId: chartId,
                includePermissionsInfo: includePermissions,
                includeLinks,
                includeFavorite,
                revId,
                workbookId,
                branch: branch ?? 'published',
            });

            return convertGetEntryResponseToGetEditorChartResponse(getEntryResponse);
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

    // WIP
    __deleteEditorChart__: createTypedAction(
        {
            paramsSchema: deleteEditorChartArgsSchema,
            resultSchema: deleteEditorChartResultSchema,
        },
        async (api, {chartId}) => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: chartId,
                scope: EntryScope.Widget,
                types: [...ENTRY_TYPES.editor, ...ENTRY_TYPES.legacyEditor],
            });

            return {};
        },
    ),
};
