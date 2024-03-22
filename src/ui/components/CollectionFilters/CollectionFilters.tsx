import React from 'react';

import {LayoutRows} from '@gravity-ui/icons';
import {Icon, RadioButton, RadioButtonSize, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import {Feature} from 'shared';
import {GetCollectionContentMode} from 'shared/schema/us/types/collections';
import {OrderBasicField, OrderDirection} from 'shared/schema/us/types/sort';
import Utils from 'ui/utils';

import GridIcon from 'assets/icons/collections/grid.svg';

import './CollectionFilters.scss';

const i18n = I18n.keyset('component.collection-filters');

const b = block('dl-collection-filters');

export enum SortType {
    FirstNew = 'firstNew',
    FirstOld = 'firstOld',
    AlphabetAsc = 'alphabetAsc',
    AlphabetDesc = 'alphabetDesc',
}

export const collectionPageViewModeStore = 'collectionPageViewMode';

export enum CollectionPageViewMode {
    Grid = 'grid',
    Table = 'table',
}

export const SORT_TYPE_VALUES: Record<
    SortType,
    {orderField: OrderBasicField; orderDirection: OrderDirection}
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
        orderField: 'title',
        orderDirection: 'asc',
    },
    [SortType.AlphabetDesc]: {
        orderField: 'title',
        orderDirection: 'desc',
    },
};

export type CollectionContentFilters = {
    filterString?: string;
    orderField: OrderBasicField;
    orderDirection: OrderDirection;
    mode: GetCollectionContentMode;
    onlyMy: boolean;
};

type Props = {
    className?: string;
    filters: CollectionContentFilters;
    compactMode?: boolean;
    controlSize?: RadioButtonSize;
    viewMode?: CollectionPageViewMode;
    onChange: (value: CollectionContentFilters) => void;
    changeViewMode?: (value: CollectionPageViewMode) => void;
};

export const CollectionFilters = React.memo<Props>(
    ({
        className,
        filters,
        compactMode = false,
        controlSize = 'm',
        viewMode,
        changeViewMode,
        onChange,
    }) => {
        const {filterString, onlyMy, mode, orderField, orderDirection} = filters;

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
                const val = value[0];
                handleChangeFilters({
                    mode: val,
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

        const handleChangeViewMode = React.useCallback(
            (value) => {
                changeViewMode?.(value);
            },
            [changeViewMode],
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
                        <Select.Option value="all">
                            {i18n('label_filter-by-type-all')}
                        </Select.Option>
                        <Select.Option value="onlyWorkbooks">
                            {i18n('label_filter-by-type-only-workbooks')}
                        </Select.Option>
                        <Select.Option value="onlyCollections">
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
                            className={b('radio-button')}
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
                            className={b('radio-button')}
                            value={viewMode}
                            size={controlSize}
                            onUpdate={handleChangeViewMode}
                        >
                            <Select.Option value={CollectionPageViewMode.Grid}>
                                <Icon data={GridIcon} />
                            </Select.Option>
                            <Select.Option value={CollectionPageViewMode.Table}>
                                <Icon data={LayoutRows} />
                            </Select.Option>
                        </RadioButton>
                    )}
                </div>
            </div>
        );
    },
);

CollectionFilters.displayName = 'CollectionFilters';
