import {ServerError} from '../../../constants/error';
import {EntryScope} from '../../../types';
import {createAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import type {GetEditorChartArgs, GetEditorChartResponse} from '../types/editor';

export const getRawEditorActions = () => ({
    getEditorChart: createAction<GetEditorChartResponse, GetEditorChartArgs>(async (api, args) => {
        const {
            chartId,
            revId,
            branch = 'published',
            workbookId,
            includePermissionsInfo = false,
            includeLinks = false,
            includeFavorite = false,
        } = args;

        const typedApi = getTypedApi(api);

        const entry = await typedApi.us.getEntry({
            entryId: chartId,
            revId,
            branch,
            workbookId,
            includePermissionsInfo,
            includeLinks,
            includeFavorite,
        });

        if (entry.scope !== EntryScope.Widget) {
            throw new ServerError('Editor chart not found', {
                status: 404,
            });
        }

        // TODO: check available types from registry

        // TODO: migration

        // const result = migrateEditorChartToActual({
        //     entry
        // });

        return {
            entryId: entry.entryId,
            key: entry.key,
            createdAt: entry.createdAt,
            createdBy: entry.createdBy,
            updatedAt: entry.updatedAt,
            updatedBy: entry.updatedBy,
            revId: entry.revId,
            savedId: entry.savedId,
            publishedId: entry.publishedId,
            tenantId: entry.tenantId,
            hidden: entry.hidden,
            public: entry.public,
            workbookId: entry.workbookId,
            scope: entry.scope as EntryScope.Widget,
            type: entry.type,
            data: entry.data,
            meta: entry.meta,
            links: entry.links,
            annotation: entry.annotation,
        };
    }),
});
