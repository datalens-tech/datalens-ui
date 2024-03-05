import type {SelectOption} from '@gravity-ui/uikit';
import {type ConnectionQueryContent, ConnectionQueryTypeValues, type WorkbookId} from 'shared';
import {getControlDisticntsFromRows} from 'shared/modules/control/typed-query-helpers';

import type {PaginationResponse} from '../../../../../../../../../components/Select/hooks/useSelectInfinityFetch/types';
import logger from '../../../../../../../../../libs/logger';
import {getSdk} from '../../../../../../../../../libs/schematic-sdk';

type GetConnectionDistinctsArgs = {
    connectionId: string | undefined;
    workbookId: WorkbookId;
    connectionQueryContent: ConnectionQueryContent | undefined;
    connectionQueryType: ConnectionQueryTypeValues | undefined;
    parameters: Record<string, string | string[]>;
};
export const getDistinctsByTypedQuery = async (
    args: GetConnectionDistinctsArgs,
): Promise<PaginationResponse<SelectOption[], any>> => {
    const {connectionId, workbookId, connectionQueryType, connectionQueryContent} = args;

    if (!connectionId || !connectionQueryType || !connectionQueryContent) {
        return {response: undefined};
    }

    try {
        const result = await getSdk().bi.getConnectionTypedQueryData({
            connectionId,
            workbookId,
            body: {
                query_content: connectionQueryContent,
                parameters: [],
                query_type: connectionQueryType,
            },
        });
        const rows = result.data?.rows ?? [];
        const distincts = getControlDisticntsFromRows(rows);
        return {
            response: distincts.map((v): SelectOption => ({content: v, value: v})),
        };
    } catch (error) {
        logger.logError('Control: getDistinctsByTypedQuery failed', error);
        console.error('SELECT_GET_ITEMS_FAILED', error);
        throw error;
    }
};
