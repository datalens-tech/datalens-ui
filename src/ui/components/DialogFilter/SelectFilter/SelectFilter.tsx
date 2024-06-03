import React from 'react';

import {Button, List, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _ from 'lodash';

import {LIST_ITEM_HEIGHT, NULL_TITLE} from '../constants';
import type {ChangeValue} from '../typings';

import './SelectFilter.scss';

const b = block('dl-dialog-filter');
const i18n = I18n.keyset('component.dl-dialog-filter.view');

enum ColumnType {
    Left = 'left',
    Right = 'right',
}

interface ListItem {
    value: string | null;
    disabled: boolean;
}

interface SelectFilterProps {
    values: (string | null)[];
    dimensions: string[];
    useSuggest: boolean;
    suggestFetching: boolean;
    changeValue: ChangeValue;
    onChangeSuggest: (search: string) => void;
}

interface SelectFilterState {
    leftFilter: string;
    rightFilter: string;
}

class SelectFilter extends React.Component<SelectFilterProps, SelectFilterState> {
    state = {
        leftFilter: '',
        rightFilter: '',
    };

    render() {
        return (
            <div className={b('filter-select')}>
                {this.renderLeftColumn()}
                {this.renderRightColumn()}
            </div>
        );
    }

    getListItemRenderer = (type: ColumnType) => {
        const renderListItem = ({value, disabled}: ListItem) => {
            const title = disabled ? NULL_TITLE : value;

            return (
                <div className={b('select-column-item')}>
                    <span
                        className={b('select-column-item-label', {empty: disabled})}
                        title={title || ''}
                    >
                        {title}
                    </span>
                    <span className={b('select-column-item-description')}>
                        {i18n(`label_select-column-${type}-item-desc`)}
                    </span>
                </div>
            );
        };

        return renderListItem;
    };

    renderLeftColumn() {
        const {values, changeValue, useSuggest, suggestFetching} = this.props;
        const {leftFilter} = this.state;
        const items = this.leftItems;

        const filteredItems = items.filter(({value}) => value !== null && value !== undefined);

        return (
            <div className={b('select-column', {[ColumnType.Left]: true})}>
                <div className={b('select-column-header')}>
                    {i18n('label_select-column-left-title')}
                    <Button
                        view="flat-secondary"
                        disabled={!filteredItems.length}
                        onClick={() => {
                            const newValues = [...values, ...filteredItems.map(({value}) => value)];

                            changeValue(newValues as string[]);
                        }}
                    >
                        {i18n('button_left-column-action')}
                    </Button>
                </div>
                {suggestFetching && (
                    <div className={b('select-column-loader')}>
                        <Loader />
                    </div>
                )}
                <div className={b('select-column-items', {disabled: suggestFetching})}>
                    <List
                        items={items}
                        itemHeight={LIST_ITEM_HEIGHT}
                        filter={leftFilter}
                        filterPlaceholder={i18n('label_filter-placeholder')}
                        renderItem={this.getListItemRenderer(ColumnType.Left)}
                        onItemClick={(item: ListItem) => {
                            let newValues = [...values];

                            if (!leftFilter && values.length && !this.rightItems.length) {
                                newValues = [];
                            }

                            newValues.push(item.value);
                            changeValue(newValues as string[]);
                        }}
                        onFilterUpdate={(newFilter: string) => {
                            if (useSuggest) {
                                this.props.onChangeSuggest(newFilter);
                            }

                            this.setState({leftFilter: newFilter});
                        }}
                    />
                </div>
            </div>
        );
    }

    renderRightColumn() {
        const {values, changeValue, suggestFetching} = this.props;
        const {rightFilter} = this.state;

        const mods = {
            [ColumnType.Right]: true,
            disabled: suggestFetching,
        };

        const items = this.rightItems;

        return (
            <div className={b('select-column', mods)}>
                <div className={b('select-column-header')}>
                    {i18n('label_select-column-right-title')}
                    <Button
                        view="flat-secondary"
                        disabled={!items.length}
                        onClick={() => {
                            const newValues = _.without(values, ...items.map(({value}) => value));
                            changeValue(newValues as string[]);
                        }}
                    >
                        {i18n('button_right-column-action')}
                    </Button>
                </div>
                <div className={b('select-column-items')}>
                    <List
                        items={items}
                        itemHeight={LIST_ITEM_HEIGHT}
                        filter={rightFilter}
                        filterPlaceholder={i18n('label_filter-placeholder')}
                        renderItem={this.getListItemRenderer(ColumnType.Right)}
                        onItemClick={(item: ListItem) => {
                            const newValues = values.filter((value) => value !== item.value);
                            changeValue(newValues as string[]);
                        }}
                        onFilterUpdate={(newFilter: string) =>
                            this.setState({rightFilter: newFilter})
                        }
                    />
                </div>
            </div>
        );
    }

    get leftItems(): ListItem[] {
        const {values, dimensions, useSuggest} = this.props;
        const {leftFilter} = this.state;

        const items = _.without(dimensions, ...values).map((value) => ({
            value,
            disabled: value === null || value === undefined,
        }));

        if (leftFilter && !useSuggest) {
            const filterInLowerCase = leftFilter.toLowerCase();
            return items.filter(({value}) => value?.toLowerCase().includes(filterInLowerCase));
        }

        return items;
    }

    get rightItems(): ListItem[] {
        const {values} = this.props;
        const {rightFilter} = this.state;

        const items = values.map((value) => ({
            value,
            disabled: value === null || value === undefined,
        }));

        if (rightFilter) {
            const filterInLowerCase = rightFilter.toLowerCase();
            return items.filter(({value}) => value?.toLowerCase().includes(filterInLowerCase));
        }

        return items;
    }
}

export default SelectFilter;
