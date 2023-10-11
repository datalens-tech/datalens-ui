import React from 'react';

import {RadioButton, RadioButtonSize, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import {Feature} from 'shared';
import {GetCollectionContentMode} from 'shared/schema/us/types/collections';
import {OrderBasicField, OrderDirection} from 'shared/schema/us/types/sort';
import Utils from 'ui/utils';

import {IconById} from '../IconById/IconById';

import './CollectionFilters.scss';

const i18n = I18n.keyset('component.collection-filters');

const b = block('dl-collection-filters');

export enum SortType {
    FirstNew = 'firstNew',
    FirstOld = 'firstOld',
    AlphabetAsc = 'alphabetAsc',
    AlphabetDesc = 'alphabetDesc',
}

export enum ViewMode {
    Grid = 'grid',
    Table = 'table',
}

export const SORT_TYPE_VALUES: Record<
    SortType,
    {orderField: OrderBasicField; orderDirection: OrderDirection}
> = {
    [SortType.FirstNew]: {
        orderField: OrderBasicField.CreatedAt,
        orderDirection: OrderDirection.Desc,
    },
    [SortType.FirstOld]: {
        orderField: OrderBasicField.CreatedAt,
        orderDirection: OrderDirection.Asc,
    },
    [SortType.AlphabetAsc]: {
        orderField: OrderBasicField.Title,
        orderDirection: OrderDirection.Asc,
    },
    [SortType.AlphabetDesc]: {
        orderField: OrderBasicField.Title,
        orderDirection: OrderDirection.Desc,
    },
};

export type CollectionContentFilters = {
    filterString?: string;
    orderField: OrderBasicField;
    orderDirection: OrderDirection;
    mode: GetCollectionContentMode;
    onlyMy: boolean;
    viewMode?: ViewMode;
};

type Props = {
    className?: string;
    filters: CollectionContentFilters;
    onChange: (value: CollectionContentFilters) => void;
    compactMode?: boolean;
    controlSize?: RadioButtonSize;
};

export const CollectionFilters = React.memo<Props>(
    ({className, filters, onChange, compactMode = false, controlSize = 'm'}) => {
        const {filterString, onlyMy, mode, orderField, orderDirection, viewMode} = filters;

        const [innerFilterString, setInnerFilterString] = React.useState<string>(
            filterString || '',
        );

        const handleChangeFilters = React.useCallback(
            (updatedValues: Partial<CollectionContentFilters>) =>
                onChange({...filters, ...updatedValues}),
            [filters, onChange],
        );

        const handleChangeFilterString = React.useMemo(
            () =>
                debounce(
                    (newValue: string | undefined) => handleChangeFilters({filterString: newValue}),
                    800,
                ),
            [handleChangeFilters],
        );

        const handleUpdateFilterString = React.useCallback(
            (val) => {
                setInnerFilterString(val);
                handleChangeFilterString(val);
            },
            [handleChangeFilterString],
        );

        const handleChangeMode = React.useCallback(
            (value) => {
                handleChangeFilters({
                    mode: value[0],
                });
            },
            [handleChangeFilters],
        );

        const handleChangeOnlyMy = React.useCallback(
            (value) => {
                handleChangeFilters({
                    onlyMy: value === 'true',
                });
            },
            [handleChangeFilters],
        );

        const handleChangeView = React.useCallback(
            (value) => {
                handleChangeFilters({
                    viewMode: value,
                });

                Utils.store('viewMode', value);
            },
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

        React.useEffect(() => {
            if (!filterString) {
                setInnerFilterString('');
            }
        }, [filterString]);

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
            <div className={b({'compact-mode': compactMode}, className)}>
                <TextInput
                    className={b('filter-string')}
                    value={innerFilterString}
                    size={controlSize}
                    onUpdate={handleUpdateFilterString}
                    placeholder={i18n('label_filter-string-placeholder')}
                    hasClear
                />

                <div className={b('filters-block')}>
                    <Select
                        className={b('filter-by-type')}
                        value={[mode]}
                        size={controlSize}
                        onUpdate={handleChangeMode}
                    >
                        <Select.Option value={GetCollectionContentMode.All}>
                            {i18n('label_filter-by-type-all')}
                        </Select.Option>
                        <Select.Option value={GetCollectionContentMode.OnlyWorkbooks}>
                            {i18n('label_filter-by-type-only-workbooks')}
                        </Select.Option>
                        <Select.Option value={GetCollectionContentMode.OnlyCollections}>
                            {i18n('label_filter-by-type-only-collections')}
                        </Select.Option>
                    </Select>

                    <Select
                        className={b('sort')}
                        value={[sortType ? sortType : '']}
                        size={controlSize}
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

                    {Utils.isEnabledFeature(Feature.HideMultitenant) ? null : (
                        <RadioButton
                            className={b('filter-by-ownership')}
                            value={onlyMy.toString()}
                            size={controlSize}
                            onUpdate={handleChangeOnlyMy}
                        >
                            <Select.Option value="false">
                                {i18n('label_filter-by-ownership-all')}
                            </Select.Option>
                            <Select.Option value="true">
                                {i18n('label_filter-by-ownership-only-my')}
                            </Select.Option>
                        </RadioButton>
                    )}

                    {!compactMode && (
                        <RadioButton
                            className={b('filter-by-ownership')}
                            value={viewMode}
                            size={controlSize}
                            onUpdate={handleChangeView}
                        >
                            <Select.Option value={ViewMode.Grid}>
                                <IconById className={b('icon-view')} id="grid" />
                            </Select.Option>
                            <Select.Option value={ViewMode.Table}>
                                <IconById className={b('icon-view')} id="table" />
                            </Select.Option>
                        </RadioButton>
                    )}
                </div>
            </div>
        );
    },
);

CollectionFilters.displayName = 'CollectionFilters';
