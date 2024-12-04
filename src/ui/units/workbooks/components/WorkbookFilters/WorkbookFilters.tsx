import React from 'react';

import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DebouncedInput} from 'components/DebouncedInput/DebouncedInput';
import {I18n} from 'i18n';
import {WorkbookPageQa} from 'shared/constants/qa/workbooks';
import type {OrderDirection, OrderWorkbookEntriesField} from 'shared/schema/us/types/sort';

import type {WorkbookEntriesFilters} from '../../types';

import './WorkbookFilters.scss';

const b = block('dl-workbook-filters');
const i18n = I18n.keyset('new-workbooks.table-filters');

enum SortType {
    FirstNew = 'firstNew',
    FirstOld = 'firstOld',
    AlphabetAsc = 'alphabetAsc',
    AlphabetDesc = 'alphabetDesc',
}

const SORT_TYPE_VALUES: Record<
    SortType,
    {orderField: OrderWorkbookEntriesField; orderDirection: OrderDirection}
> = {
    [SortType.FirstNew]: {
        orderField: 'createdAt',
        orderDirection: 'desc',
    },
    [SortType.FirstOld]: {
        orderField: 'createdAt',
        orderDirection: 'asc',
    },
    [SortType.AlphabetAsc]: {
        orderField: 'name',
        orderDirection: 'asc',
    },
    [SortType.AlphabetDesc]: {
        orderField: 'name',
        orderDirection: 'desc',
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
        (val) => {
            const type = val[0] as SortType;
            const sortTypeValues = SORT_TYPE_VALUES[type];

            handleChangeFilters({
                orderField: sortTypeValues.orderField,
                orderDirection: sortTypeValues.orderDirection,
            });
        },
        [handleChangeFilters],
    );

    const sortType = React.useMemo<SortType | undefined>(() => {
        const types = Object.keys(SORT_TYPE_VALUES) as SortType[];

        return types.find((val) => {
            const type = val as SortType;
            const sortTypeValues = SORT_TYPE_VALUES[type];

            return (
                sortTypeValues.orderField === orderField &&
                sortTypeValues.orderDirection === orderDirection
            );
        });
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

                <Select
                    className={b('sort')}
                    value={[sortType ? sortType : '']}
                    size="l"
                    onUpdate={handleChangeSort}
                >
                    <Select.Option value={SortType.FirstNew}>
                        {i18n('label_sort-first-new')}
                    </Select.Option>
                    <Select.Option value={SortType.FirstOld}>
                        {i18n('label_sort-first-old')}
                    </Select.Option>
                    <Select.Option value={SortType.AlphabetAsc}>
                        {i18n('label_sort-first-alphabet-asc')}
                    </Select.Option>
                    <Select.Option value={SortType.AlphabetDesc}>
                        {i18n('label_sort-first-alphabet-desc')}
                    </Select.Option>
                </Select>
            </div>
        </div>
    );
};
