import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import {
    CreateEditorChartArgs,
    CreateEditorChartResponse,
    UpdateEditorChartArgs,
    UpdateEditorChartResponse,
} from '../types';

const PATH_PREFIX = '/v1';

export const editorActions = {
    _createEditorChart: createAction<CreateEditorChartResponse, CreateEditorChartArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/entries`,
        params: ({type, key, data, meta = {}, name, workbookId}, headers) => {
            return {
                body: {
                    scope: 'widget',
                    type,
                    key,
                    meta,
                    data,
                    name,
                    workbookId,
                },
                headers,
            };
        },
    }),
    _updateEditorChart: createAction<UpdateEditorChartResponse, UpdateEditorChartArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}`,
        params: ({data, mode, revId, meta = {}, links = {}}, headers) => {
            return {
                body: {
                    mode,
                    meta,
                    data,
                    revId,
                    links,
                },
                headers,
            };
        },
    }),
};
