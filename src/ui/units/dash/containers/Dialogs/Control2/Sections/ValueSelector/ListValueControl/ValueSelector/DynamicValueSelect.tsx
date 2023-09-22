import React from 'react';

import {SelectOption} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import {useSelector} from 'react-redux';
import {TIMEOUT_90_SEC, getFieldsApiV2RequestSection} from 'shared';
import {VIEW_MODES} from 'ui/components/Select/hooks/useSelectRenderFilter/useSelectRenderFilter';
import {
    SelectFeaturedAsync,
    SelectFeaturedAsyncProps,
} from 'ui/components/Select/wrappers/SelectFeaturedAsync';
import {selectSelectorDialog} from 'ui/units/dash/store/selectors/dashTypedSelectors';

import {useSetSelectorDialogItem} from './hooks';
import {convertDefaultValue} from './utils';

import '../../../../Control2.scss';

const i18n = I18n.keyset('dash.control-dialog.edit');

const DEFAULT_PAGE_SIZE = 100;

export type PaginationType = {
    pageNumber: number;
    pageSize: number;
};

const hasNextPage = (arr: unknown[], pageSize: number) => {
    if (!arr?.length) {
        return false;
    }

    return !(arr.length % pageSize);
};

type GetDistincts = {
    datasetId?: string;
    datasetFieldId?: string;
    searchPattern?: string;
    nextPageToken?: number | null;
    pageSize: number;
};

const getDistincts = async ({
    datasetId,
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
        logger.logError('Control: getDistincts failed', error);
        console.error('SELECT_GET_ITEMS_FAILED', error);
        throw error;
    }
};

export const DynamicValueSelect = () => {
    const [searchPattern, setSearchPattern] = React.useState('');

    const selectorDialogState = useSelector(selectSelectorDialog);
    const {datasetId, datasetFieldId, multiselectable} = selectorDialogState;
    const defaultValue = convertDefaultValue(selectorDialogState.defaultValue);

    const {setSelectorDialogItem} = useSetSelectorDialogItem();

    const onFilterChange = React.useCallback<
        NonNullable<SelectFeaturedAsyncProps['onFilterChange']>
    >((pattern, mode) => {
        if (mode === VIEW_MODES.ALL) {
            setSearchPattern(pattern);
        }
    }, []);

    const fetcher = React.useCallback(
        ({pageNumber, pageSize} = {pageNumber: 0, pageSize: DEFAULT_PAGE_SIZE}) =>
            getDistincts({
                datasetId,
                datasetFieldId,
                nextPageToken: pageNumber,
                searchPattern,
                pageSize,
            }),
        [datasetId, datasetFieldId, searchPattern],
    );

    const handleUpdate = React.useCallback(
        (val) => {
            setSelectorDialogItem({defaultValue: val});
        },
        [setSelectorDialogItem],
    );

    return (
        <SelectFeaturedAsync<any, PaginationType>
            multiple={multiselectable}
            width="max"
            popupWidth={'fit'}
            disabled={!datasetId || !datasetFieldId}
            value={defaultValue}
            onUpdate={handleUpdate}
            fetcher={fetcher}
            onFilterChange={onFilterChange}
            placeholder={i18n('value_undefined')}
        />
    );
};
