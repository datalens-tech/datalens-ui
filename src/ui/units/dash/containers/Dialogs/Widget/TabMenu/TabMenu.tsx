import React from 'react';

import {CopyPlus, Plus, Star, StarFill} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ListWithMenu} from 'components/ListWithMenu/ListWithMenu';
import {ListWithRemove} from 'components/ListWithRemove/ListWithRemove';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import {TabMenuQA} from 'shared';

import {TabActionType} from './types';
import type {TabMenuItemData, TabMenuProps, UpdateState} from './types';

import './TabMenu.scss';

const b = block('tab-menu');

const ADD_BUTTON_DEFAULT_SIZE = 16;

export class TabMenu<T> extends React.PureComponent<TabMenuProps<T>> {
    render() {
        const {
            enableActionMenu,
            addButtonText,
            items,
            selectedItemIndex,
            tabIconMixin,
            pasteButtonText,
            onPasteItem,
        } = this.props;

        return (
            <div className={b()}>
                {enableActionMenu
                    ? this.renderListWithMenu(items, selectedItemIndex)
                    : this.renderListWithRemove(items, selectedItemIndex)}
                <div
                    className={b('add-tab')}
                    onClick={this.onAction({action: TabActionType.Add})}
                    data-qa={TabMenuQA.Add}
                >
                    <Icon
                        data={Plus}
                        className={b('add-tab-icon', tabIconMixin)}
                        width={ADD_BUTTON_DEFAULT_SIZE}
                    />
                    <span>{addButtonText || i18n('dash.widget-dialog.edit', 'button_add')}</span>
                </div>
                {onPasteItem && (
                    <div
                        className={b('paste-tab')}
                        onClick={this.onAction({action: TabActionType.Paste})}
                        data-qa={TabMenuQA.Paste}
                    >
                        <Icon
                            data={CopyPlus}
                            className={b('add-tab-icon', tabIconMixin)}
                            width={ADD_BUTTON_DEFAULT_SIZE}
                        />
                        <span>
                            {pasteButtonText || i18n('dash.widget-dialog.edit', 'button_add')}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    onAction =
        ({action, index}: {action: Exclude<TabActionType, 'skipped'>; index?: number}) =>
        (event: React.MouseEvent) => {
            event.stopPropagation();
            let data;

            if (index === undefined) {
                data = this[action as TabActionType.Add | TabActionType.Paste]();
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
            action: TabActionType.Add,
        };
    }

    paste(): UpdateState<T> {
        if (!this.props.onPasteItem) {
            return {
                action: TabActionType.Skipped,
            };
        }

        const items = [...this.props.items, ...this.props.onPasteItem()];

        return {
            items,
            selectedItemIndex: this.props.items.length || 0,
            action: TabActionType.Paste,
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
            action: TabActionType.ChangeChosen,
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
                    className: b('list', {'with-paste': Boolean(this.props.onPasteItem)}),
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
                    action: TabActionType.ChangeChosen,
                    index: itemIndex,
                })}
                key={itemIndex}
                data-qa={TabMenuQA.Item}
            >
                <div className={b('item-content')}>
                    <span
                        className={b('item-star')}
                        onClick={this.onAction({
                            action: TabActionType.ChangeDefault,
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
