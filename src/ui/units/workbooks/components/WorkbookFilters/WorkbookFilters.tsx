import React from 'react';

import block from 'bem-cn-lite';
import {DebouncedInput} from 'components/DebouncedInput/DebouncedInput';
import {OrderBySelect, SORT_TYPE} from 'components/OrderBySelect';
import type {OrderBy, OrderByOptions, SortType} from 'components/OrderBySelect';
import {I18n} from 'i18n';
import {WorkbookPageQa} from 'shared/constants/qa/workbooks';
import type {OrderDirection, OrderWorkbookEntriesField} from 'shared/schema/us/types/sort';

import type {WorkbookEntriesFilters} from '../../types';

import './WorkbookFilters.scss';

const b = block('dl-workbook-filters');
const i18n = I18n.keyset('new-workbooks.table-filters');

const SORT_TYPE_VALUES: OrderByOptions<SortType, OrderWorkbookEntriesField, OrderDirection> = {
    [SORT_TYPE.FIRST_NEW]: {
        field: 'createdAt',
        direction: 'desc',
        content: i18n('label_sort-first-new'),
    },
    [SORT_TYPE.FIRST_OLD]: {
        field: 'createdAt',
        direction: 'asc',
        content: i18n('label_sort-first-old'),
    },
    [SORT_TYPE.ALPHABET_ASC]: {
        field: 'name',
        direction: 'asc',
        content: i18n('label_sort-first-alphabet-asc'),
    },
    [SORT_TYPE.ALPHABET_DESC]: {
        field: 'name',
        direction: 'desc',
        content: i18n('label_sort-first-alphabet-desc'),
    },
};

type Props = {
    filters: WorkbookEntriesFilters;
    onChange: (value: WorkbookEntriesFilters) => void;
    className?: string;
};

export const WorkbookFilters = ({className, filters, onChange}: Props) => {
    const {filterString, orderField, orderDirection} = filters;

    const handleChangeFilters = React.useCallback(
        (updatedValues: Partial<WorkbookEntriesFilters>) =>
            onChange({...filters, ...updatedValues}),
        [filters, onChange],
    );

    const handleChangeFilterString = React.useCallback(
        (value) =>
            handleChangeFilters({
                filterString: value || undefined,
            }),
        [handleChangeFilters],
    );

    const handleChangeSort = React.useCallback(
        ({field, direction}: OrderBy<OrderWorkbookEntriesField, OrderDirection>) => {
            handleChangeFilters({
                orderField: field,
                orderDirection: direction,
            });
        },
        [handleChangeFilters],
    );

    const orderBy = React.useMemo(() => {
        return {
            field: orderField,
            direction: orderDirection,
        };
    }, [orderField, orderDirection]);

    return (
        <div className={b(null, className)}>
            <div className={b('controls')} data-qa={WorkbookPageQa.Filters}>
                <DebouncedInput
                    className={b('filter-string')}
                    value={filterString}
                    size="l"
                    onUpdate={handleChangeFilterString}
                    placeholder={i18n('label_filter-string-placeholder')}
                    hasClear={true}
                />

                <OrderBySelect
                    className={b('sort')}
                    orderBy={orderBy}
                    orderByOptions={SORT_TYPE_VALUES}
                    size="l"
                    onChange={handleChangeSort}
                />
            </div>
        </div>
    );
};
