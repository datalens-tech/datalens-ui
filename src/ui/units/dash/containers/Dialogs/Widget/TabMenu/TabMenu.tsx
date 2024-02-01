import React from 'react';

import {Plus, Star, StarFill} from '@gravity-ui/icons';
import {Button, Icon, ListItemData} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ListWithMenu} from 'components/ListWithMenu/ListWithMenu';
import {ListWithRemove} from 'components/ListWithRemove/ListWithRemove';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import {TabMenuQA} from 'shared';

import './TabMenu.scss';

const b = block('tab-menu');

type TabMenuItemData<T> = ListItemData<T> & {title?: string; isDefault?: boolean};

type TabMenuProps<T> = {
    items: TabMenuItemData<T>[];
    selectedItemIndex: number;
    update: ({items, selectedItemIndex, action}: ListState<T>) => void;
    enableActionMenu?: boolean;
    addButtonText?: string;
    defaultTabText?: () => string;
    tabIconMixin?: string;
};

export type ListState<T> = {
    items: TabMenuItemData<T>[];
    selectedItemIndex: number;
    action?: TabActionType;
};

export type TabActionType = 'add' | 'delete' | 'changeChosen' | 'changeDefault';

export class TabMenu<T> extends React.PureComponent<TabMenuProps<T>> {
    render() {
        const {enableActionMenu, addButtonText, items, selectedItemIndex, tabIconMixin} =
            this.props;

        return (
            <div className={b()}>
                {enableActionMenu
                    ? this.renderListWithMenu(items, selectedItemIndex)
                    : this.renderListWithRemove(items, selectedItemIndex)}
                <div
                    className={b('add-tab')}
                    onClick={this.onAction({action: 'add'})}
                    data-qa={TabMenuQA.Add}
                >
                    <Icon data={Plus} className={b('add-tab-icon', tabIconMixin)} width={16} />
                    <span>
                        {addButtonText || i18n('dash.widget-dialog.edit', 'button_add', {index: 1})}
                    </span>
                </div>
            </div>
        );
    }

    onAction =
        ({action, index}: {action: TabActionType; index?: number}) =>
        (event: React.MouseEvent) => {
            event.stopPropagation();
            let data;

            if (index === undefined) {
                data = this[action as Extract<'add', TabActionType>]();
            } else {
                data = this[action](index);
            }

            if (data) {
                this.props.update(data);
            }
        };

    onRemove = (deletedItem: TabMenuItemData<T> | number) => {
        let deletedItemIndex = deletedItem;
        if (!Number.isFinite(deletedItem)) {
            deletedItemIndex = this.props.items.findIndex((item) => deletedItem === item);
        }
        this.props.update(this.delete(deletedItemIndex as number));
    };

    tabText(index = this.props.items.length) {
        return (
            this.props.defaultTabText?.() ||
            i18n('dash.widget-dialog.edit', 'value_title-default', {index: index + 1})
        );
    }

    add() {
        const newItem = {title: this.tabText()} as TabMenuItemData<T>;
        const items = [...this.props.items, newItem];
        const len = this.props.items.length;

        return {
            items,
            selectedItemIndex: len ? items.length - 1 : 0,
            action: 'add',
        };
    }

    changeDefault(index: number) {
        const items = this.props.items.map((item, itemIndex) => ({
            ...item,
            isDefault: index === itemIndex,
        }));

        return {
            items,
            selectedItemIndex: this.props.selectedItemIndex,
        };
    }

    changeChosen(index: number) {
        const {selectedItemIndex} = this.props;
        if (selectedItemIndex === index) {
            return null;
        }
        let items = this.props.items;
        if (items[selectedItemIndex].title?.trim() === '') {
            items = items.map((item, i) => {
                if (i === selectedItemIndex) {
                    return {...item, title: this.tabText(selectedItemIndex)};
                }
                return item;
            });
        }
        return {
            items,
            selectedItemIndex: index,
            action: 'changeChosen',
        };
    }

    delete(index: number) {
        const items = this.props.items.filter((_, itemIndex) => index !== itemIndex);
        const isDeletingChosenItem = this.props.selectedItemIndex === index;
        let {selectedItemIndex} = this.props;

        if (this.props.items[index].isDefault) {
            items[Math.min(index, items.length - 1)].isDefault = true;
        }

        if (isDeletingChosenItem) {
            selectedItemIndex = Math.min(index, items.length - 1);
        } else if (index < selectedItemIndex) {
            selectedItemIndex = selectedItemIndex - 1;
        }

        return {
            items,
            selectedItemIndex,
        };
    }

    moveItem = (dragIndex: number, hoverIndex: number) => {
        const {items} = this.props;
        const dragItem = items[dragIndex];

        const newItems = update(items, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, dragItem],
            ],
        });

        let {selectedItemIndex} = this.props;

        const selectedItemIndexWasChanged =
            (dragIndex <= selectedItemIndex && hoverIndex >= selectedItemIndex) ||
            // if the element being dragged is lower than the active one
            (dragIndex >= selectedItemIndex && hoverIndex <= selectedItemIndex);
        // or the element being dragged turned out to be higher than the active one

        if (selectedItemIndexWasChanged) {
            if (selectedItemIndex === dragIndex) {
                selectedItemIndex = hoverIndex; // if the active element itself was dragged
            } else {
                selectedItemIndex =
                    dragIndex < hoverIndex
                        ? this.props.selectedItemIndex - 1
                        : this.props.selectedItemIndex + 1;
            }
        }

        this.props.update({
            items: newItems,
            selectedItemIndex,
        });
    };

    renderListWithMenu = (items: TabMenuItemData<T>[], selectedItemIndex: number) => {
        return (
            <ListWithMenu
                list={{
                    items,
                    filterable: false,
                    sortable: true,
                    virtualized: false,
                    deactivateOnLeave: true,
                    selectedItemIndex,
                    className: b('list'),
                    onSortEnd: ({oldIndex, newIndex}) => this.moveItem(oldIndex, newIndex),
                    itemClassName: b('list-item'),
                }}
                onRemove={this.onRemove}
                onAction={this.onAction}
                iconOnHover={true}
            />
        );
    };

    renderListWithRemove = (items: TabMenuItemData<T>[], selectedItemIndex: number) => {
        return (
            <ListWithRemove
                list={{
                    items,
                    filterable: false,
                    sortable: true,
                    virtualized: false,
                    selectedItemIndex,
                    className: b('list'),
                    onSortEnd: ({oldIndex, newIndex}) => this.moveItem(oldIndex, newIndex),
                    renderItem: this.starListRenderer,
                    itemClassName: b('list-item'),
                }}
                onRemove={this.onRemove}
                iconOnHover={true}
                disableSingleItemRemove={true}
            />
        );
    };

    starListRenderer = ({title, isDefault}: TabMenuItemData<T>, _: boolean, itemIndex: number) => {
        return (
            <div
                className={b('item')}
                onClick={this.onAction({
                    action: 'changeChosen',
                    index: itemIndex,
                })}
                key={itemIndex}
                data-qa={TabMenuQA.Item}
            >
                <div className={b('item-content')}>
                    <span
                        className={b('item-star')}
                        onClick={this.onAction({
                            action: 'changeDefault',
                            index: itemIndex,
                        })}
                    >
                        {isDefault ? (
                            <Button view="flat">
                                <Icon data={StarFill} className={b('item-star-active')} />
                            </Button>
                        ) : (
                            <Button view="flat">
                                <Icon data={Star} className={b('item-star-inactive')} />
                            </Button>
                        )}
                    </span>
                    <span className={b('item-text')}>{title}</span>
                </div>
            </div>
        );
    };
}
