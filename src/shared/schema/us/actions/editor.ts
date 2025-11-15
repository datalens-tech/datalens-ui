import {EntryUpdateMode} from '../../..';
import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import type {
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
        params: (
            {
                version,
                type,
                key,
                data,
                meta = {},
                name,
                workbookId,
                mode = EntryUpdateMode.Publish,
                links,
                description = '',
                annotation,
            },
            headers,
        ) => {
            return {
                body: {
                    version,
                    scope: 'widget',
                    type,
                    key,
                    meta,
                    data,
                    name,
                    workbookId,
                    mode,
                    links,
                    annotation: {
                        description: annotation?.description ?? description,
                    },
                },
                headers,
            };
        },
    }),
    _updateEditorChart: createAction<UpdateEditorChartResponse, UpdateEditorChartArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}`,

        params: (
            {version, data, mode, revId, meta = {}, links, annotation, description = ''},
            headers,
        ) => {
            return {
                body: {
                    version,
                    mode,
                    meta,
                    data,
                    revId,
                    links,
                    annotation: {
                        description: annotation?.description ?? description,
                    },
                },
                headers,
            };
        },
    }),
};
