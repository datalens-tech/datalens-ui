import React from 'react';

import {LayoutRows} from '@gravity-ui/icons';
import type {SegmentedRadioGroupSize as RadioButtonSize} from '@gravity-ui/uikit';
import {Icon, SegmentedRadioGroup as RadioButton, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import {Feature} from 'shared';
import type {GetStructureItemsMode} from 'shared/schema/us/types/collections';
import type {OrderBasicField, OrderDirection} from 'shared/schema/us/types/sort';
import {OrderBySelect, SORT_TYPE} from 'ui/components/OrderBySelect';
import type {OrderBy, OrderByOptions, SortType} from 'ui/components/OrderBySelect';
import Tabs from 'ui/components/Tabs/Tabs';
import {DL} from 'ui/constants/common';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import GridIcon from 'assets/icons/collections/grid.svg';

import './CollectionFilters.scss';

const i18n = I18n.keyset('component.collection-filters');

const b = block('dl-collection-filters');

export const collectionPageViewModeStore = 'collectionPageViewMode';

export enum CollectionPageViewMode {
    Grid = 'grid',
    Table = 'table',
}

export const SORT_TYPE_VALUES: OrderByOptions<SortType, OrderBasicField, OrderDirection> = {
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
        field: 'title',
        direction: 'asc',
        content: i18n('label_sort-first-alphabet-asc'),
    },
    [SORT_TYPE.ALPHABET_DESC]: {
        field: 'title',
        direction: 'desc',
        content: i18n('label_sort-first-alphabet-desc'),
    },
};

export type StructureItemsFilters = {
    filterString?: string;
    orderField: OrderBasicField;
    orderDirection: OrderDirection;
    mode: GetStructureItemsMode;
    onlyMy: boolean;
};

type Props = {
    className?: string;
    filters: StructureItemsFilters;
    compactMode?: boolean;
    controlSize?: RadioButtonSize;
    viewMode?: CollectionPageViewMode;
    onChange: (value: StructureItemsFilters) => void;
    changeViewMode?: (value: CollectionPageViewMode) => void;
};

const onlyMyOptions = [
    {value: 'false', content: i18n('label_filter-by-ownership-all')},
    {value: 'true', content: i18n('label_filter-by-ownership-only-my')},
];

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
            (updatedValues: Partial<StructureItemsFilters>) =>
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
            ({field, direction}: OrderBy<OrderBasicField, OrderDirection>) => {
                handleChangeFilters({
                    orderField: field,
                    orderDirection: direction,
                });
            },
            [handleChangeFilters],
        );

        React.useEffect(() => {
            if (!filterString) {
                setInnerFilterString('');
            }
        }, [filterString]);

        const orderBy = React.useMemo(() => {
            return {
                field: orderField,
                direction: orderDirection,
            };
        }, [orderField, orderDirection]);

        if (DL.IS_MOBILE) {
            const tabItems = onlyMyOptions.map(({value, content}) => ({
                id: value,
                title: content,
            }));

            return (
                <React.Fragment>
                    {isEnabledFeature(Feature.HideMultitenant) ? null : (
                        <Tabs
                            items={tabItems}
                            activeTab={onlyMy.toString()}
                            size={MOBILE_SIZE.TABS}
                            onSelectTab={handleChangeOnlyMy}
                        />
                    )}
                </React.Fragment>
            );
        }

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

                    <OrderBySelect
                        className={b('sort')}
                        orderBy={orderBy}
                        orderByOptions={SORT_TYPE_VALUES}
                        size={controlSize}
                        onChange={handleChangeSort}
                    />

                    {isEnabledFeature(Feature.HideMultitenant) ? null : (
                        <RadioButton
                            className={b('radio-button')}
                            value={onlyMy.toString()}
                            size={controlSize}
                            onUpdate={handleChangeOnlyMy}
                            options={onlyMyOptions}
                        />
                    )}

                    {!compactMode && (
                        <RadioButton
                            className={b('radio-button')}
                            value={viewMode}
                            size={controlSize}
                            onUpdate={handleChangeViewMode}
                        >
                            <RadioButton.Option value={CollectionPageViewMode.Grid}>
                                <Icon data={GridIcon} />
                            </RadioButton.Option>
                            <RadioButton.Option value={CollectionPageViewMode.Table}>
                                <Icon data={LayoutRows} />
                            </RadioButton.Option>
                        </RadioButton>
                    )}
                </div>
            </div>
        );
    },
);

CollectionFilters.displayName = 'CollectionFilters';
