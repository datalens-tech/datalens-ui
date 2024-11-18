import type {SelectOption} from '@gravity-ui/uikit';
import {TIMEOUT_90_SEC, type WorkbookId, getFieldsApiV2RequestSection} from 'shared';

import logger from '../../../../../../libs/logger';
import {getSdk} from '../../../../../../libs/schematic-sdk';

export const DEFAULT_PAGE_SIZE = 100;
const hasNextPage = (arr: unknown[], pageSize: number) => {
    if (!arr?.length) {
        return false;
    }

    return !(arr.length % pageSize);
};

type GetDistincts = {
    datasetId?: string;
    workbookId: WorkbookId;
    datasetFieldId?: string;
    searchPattern?: string;
    nextPageToken?: number | null;
    pageSize: number;
};

export const getDistinctsByDatasetField = async ({
    datasetId,
    workbookId,
    datasetFieldId,
    searchPattern,
    nextPageToken,
    pageSize,
}: GetDistincts) => {
    if (!datasetId || !datasetFieldId || !Number.isInteger(nextPageToken)) return {};

    const fields = getFieldsApiV2RequestSection([{guid: datasetFieldId}], 'distinct');
    const filters = searchPattern
        ? [
              {
                  ref: {type: 'id', id: datasetFieldId} as const,
                  operation: 'ICONTAINS',
                  values: [searchPattern],
              },
          ]
        : undefined;

    try {
        const {
            result: {
                data: {Data},
            },
        } = await getSdk().bi.getDistinctsApiV2(
            {
                datasetId,
                workbookId,
                fields,
                limit: pageSize,
                offset: pageSize * (nextPageToken as number),
                filters,
            },
            {timeout: TIMEOUT_90_SEC},
        );

        const response = Data.map(([value]): SelectOption => ({value, content: value}));
        const pagination = hasNextPage(response, pageSize)
            ? {
                  pageNumber: (nextPageToken as number) + 1,
                  pageSize: DEFAULT_PAGE_SIZE,
              }
            : undefined;
        return {
            response,
            pagination,
        };
    } catch (error) {
        logger.logError('Control: getDistinctsByDatasetField failed', error);
        console.error('SELECT_GET_ITEMS_FAILED', error);
        throw error;
    }
};
