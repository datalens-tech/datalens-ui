import {DeveloperModeCheckStatus} from '../../../types';
import {createAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import type {
    CreateEditorChartArgs,
    CreateEditorChartResponse,
    UpdateEditorChartArgs,
    UpdateEditorChartResponse,
} from '../../us/types';
import {getEntryLinks} from '../helpers';
import {validateData} from '../helpers/editor/validation';

export const editorActions = {
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
};
