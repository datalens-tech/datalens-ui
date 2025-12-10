import React from 'react';

import {CopyPlus, Plus, Star, StarFill} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ListWithMenu} from 'components/ListWithMenu/ListWithMenu';
import {ListWithRemove} from 'components/ListWithRemove/ListWithRemove';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import {useSelector} from 'react-redux';
import {TabMenuQA} from 'shared';
import {getRandomKey} from 'ui/libs/DatalensChartkit/helpers/helpers';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';
import {getPastedWidgetData} from 'ui/units/dash/modules/helpers';
import {selectDashWorkbookId} from 'ui/units/dash/store/selectors/dashTypedSelectors';

import {TabActionType} from './types';
import type {TabMenuItemData, TabMenuProps, TabsWithMenu, UpdateState} from './types';

import './TabMenu.scss';

const b = block('tab-menu');

const ADD_BUTTON_DEFAULT_SIZE = 16;

export const TabMenu = <T extends unknown>({
    view,
    canPasteItems,
    enableActionMenu,
    items,
    selectedItemIndex,
    onUpdate,
    defaultTabText,
    onPasteItems,
    tabIconMixin,
    addButtonText,
    pasteButtonText,
    onCopyItem,
    onUpdateItem,
    renderWrapper,
    className,
}: TabMenuProps<T>) => {
    const [pasteConfig, setPasteConfig] = React.useState<CopiedConfigData | null>(null);
    const workbookId = useSelector(selectDashWorkbookId);

    React.useEffect(() => {
        const storageHandler = () => {
            const pastedWidget = getPastedWidgetData();
            if (canPasteItems?.(pastedWidget, workbookId)) {
                setPasteConfig(pastedWidget);
                return;
            }
            setPasteConfig(null);
        };

        if (canPasteItems) {
            storageHandler();
            window.addEventListener('storage', storageHandler);
        }

        return () => {
            window.removeEventListener('storage', storageHandler);
        };
    }, [canPasteItems, workbookId]);

    const getTabText = React.useCallback(
        (index = items.length) => {
            return (
                defaultTabText?.() ||
                i18n('dash.widget-dialog.edit', 'value_title-default', {index: index + 1})
            );
        },
        [defaultTabText, items.length],
    );

    const addItem = React.useCallback(() => {
        const newItem = {title: getTabText()} as TabMenuItemData<T>;
        const updatedItems = [...items, newItem];
        const len = items.length;

        return {
            items: updatedItems,
            selectedItemIndex: len ? updatedItems.length - 1 : 0,
            action: TabActionType.Add,
        };
    }, [items, getTabText]);

    const pasteItem = React.useCallback(
        (item?: TabMenuItemData<T>, index?: number): UpdateState<T> => {
            const pasteItems = item ? [item] : onPasteItems?.(pasteConfig);
            if (!pasteItems) {
                return {
                    action: TabActionType.Skipped,
                };
            }

            const pastItemsWithId = pasteItems.map((controlItem) => ({
                ...controlItem,
                id: undefined,
                draftId: getRandomKey(),
            }));

            const updatedItems = [...items];
            updatedItems.splice(index || updatedItems.length, 0, ...pastItemsWithId);

            return {
                items: updatedItems,
                selectedItemIndex: index || items.length || 0,
                action: TabActionType.Paste,
            };
        },
        [items, onPasteItems, pasteConfig],
    );

    const changeDefault = React.useCallback(
        (index: number) => {
            const updatedItems = items.map((item, itemIndex) => ({
                ...item,
                isDefault: index === itemIndex,
            }));

            return {
                items: updatedItems,
                selectedItemIndex,
            };
        },
        [items, selectedItemIndex],
    );

    const changeChosen = React.useCallback(
        (index: number) => {
            if (selectedItemIndex === index) {
                return null;
            }
            let updatedItems = items;
            if (updatedItems[selectedItemIndex].title?.trim() === '') {
                updatedItems = updatedItems.map((item, i) => {
                    if (i === selectedItemIndex) {
                        return {...item, title: getTabText(selectedItemIndex)};
                    }
                    return item;
                });
            }
            return {
                items: updatedItems,
                selectedItemIndex: index,
                action: TabActionType.ChangeChosen,
            };
        },
        [selectedItemIndex, items, getTabText],
    );

    const removeItem = React.useCallback(
        (index: number) => {
            const updatedItems = items.filter((_, itemIndex) => index !== itemIndex);
            const isDeletingChosenItem = selectedItemIndex === index;
            let updatedSelectedItemIndex = selectedItemIndex;

            if (items[index].isDefault) {
                updatedItems[Math.min(index, updatedItems.length - 1)].isDefault = true;
            }

            if (isDeletingChosenItem) {
                updatedSelectedItemIndex = Math.min(index, updatedItems.length - 1);
            } else if (index < selectedItemIndex) {
                updatedSelectedItemIndex = selectedItemIndex - 1;
            }

            return {
                items: updatedItems,
                selectedItemIndex: updatedSelectedItemIndex,
            };
        },
        [items, selectedItemIndex],
    );

    const onAction = React.useCallback(
        ({action, index}: {action: Exclude<TabActionType, 'skipped'>; index?: number}) =>
            (event: React.MouseEvent) => {
                let data;

                if (index === undefined) {
                    data = action === TabActionType.Paste ? pasteItem() : addItem();
                } else {
                    switch (action) {
                        case TabActionType.ChangeChosen:
                            data = changeChosen(index);
                            break;
                        case TabActionType.ChangeDefault:
                            data = changeDefault(index);
                            event.stopPropagation();
                            break;
                        case TabActionType.Delete:
                            data = removeItem(index);
                            break;
                    }
                }

                if (data) {
                    onUpdate(data);
                }
            },
        [addItem, changeChosen, changeDefault, onUpdate, pasteItem, removeItem],
    );

    const onRemove = React.useCallback(
        (removeItemdItemIndex: number) => {
            onUpdate(removeItem(removeItemdItemIndex));
        },
        [onUpdate, removeItem],
    );

    const onDuplicate = React.useCallback(
        (itemIndex: number) => {
            const item = items[itemIndex];
            onUpdate(pasteItem({...item}, itemIndex + 1));
        },
        [items, onUpdate, pasteItem],
    );

    const moveItem = React.useCallback(
        (dragIndex: number, hoverIndex: number) => {
            const dragItem = items[dragIndex];

            const newItems = update(items, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragItem],
                ],
            });

            let updatedSelectedItemIndex = selectedItemIndex;

            const selectedItemIndexWasChanged =
                (dragIndex <= selectedItemIndex && hoverIndex >= selectedItemIndex) ||
                // if the element being dragged is lower than the active one
                (dragIndex >= selectedItemIndex && hoverIndex <= selectedItemIndex);
            // or the element being dragged turned out to be higher than the active one

            if (selectedItemIndexWasChanged) {
                if (selectedItemIndex === dragIndex) {
                    updatedSelectedItemIndex = hoverIndex; // if the active element itself was dragged
                } else {
                    updatedSelectedItemIndex =
                        dragIndex < hoverIndex ? selectedItemIndex - 1 : selectedItemIndex + 1;
                }
            }

            onUpdate({
                items: newItems,
                selectedItemIndex: updatedSelectedItemIndex,
            });
        },
        [items, selectedItemIndex, onUpdate],
    );

    const renderButtons = React.useCallback(() => {
        const addBtnText =
            !pasteConfig && addButtonText
                ? addButtonText
                : i18n('dash.widget-dialog.edit', 'button_add');
        return (
            <div className={b('buttons-row')}>
                <Button
                    className={b('action-button')}
                    onClick={onAction({action: TabActionType.Add})}
                    qa={TabMenuQA.Add}
                    view={view === 'new' ? 'flat-secondary' : 'outlined'}
                    size={view === 'new' ? 'l' : 'm'}
                    width="max"
                >
                    <Icon
                        data={Plus}
                        className={b('action-button-icon', tabIconMixin)}
                        width={ADD_BUTTON_DEFAULT_SIZE}
                    />
                    <span>{addBtnText}</span>
                </Button>
                {pasteConfig && (
                    <Button
                        view="outlined"
                        className={b('action-button')}
                        onClick={onAction({action: TabActionType.Paste})}
                        qa={TabMenuQA.Paste}
                        width="max"
                    >
                        <Icon
                            data={CopyPlus}
                            className={b('action-button-icon', tabIconMixin)}
                            width={ADD_BUTTON_DEFAULT_SIZE}
                        />
                        <span>
                            {pasteButtonText || i18n('dash.widget-dialog.edit', 'button_add')}
                        </span>
                    </Button>
                )}
            </div>
        );
    }, [pasteConfig, addButtonText, onAction, view, tabIconMixin, pasteButtonText]);

    const renderListWithMenu = React.useCallback(
        (
            items: TabMenuItemData<T>[],
            selectedItemIndex: number,
            onUpdateItem: TabsWithMenu['onUpdateItem'],
        ) => {
            return (
                <ListWithMenu
                    list={{
                        items,
                        filterable: false,
                        sortable: true,
                        virtualized: false,
                        deactivateOnLeave: true,
                        selectedItemIndex,
                        className: b('list', {view}),
                        onSortEnd: ({oldIndex, newIndex}) => moveItem(oldIndex, newIndex),
                        itemClassName: b('list-item', {view}),
                    }}
                    onRemove={onRemove}
                    onAction={onAction}
                    onDuplicate={onDuplicate}
                    iconOnHover={true}
                    onCopy={onCopyItem}
                    onUpdateItem={onUpdateItem}
                    renderWrapper={renderWrapper}
                />
            );
        },
        [view, moveItem, onRemove, onAction, onDuplicate, onCopyItem, renderWrapper],
    );

    const renderStarListItem = React.useCallback(
        ({title, isDefault}: TabMenuItemData<T>, _: boolean, itemIndex: number) => {
            return (
                <div
                    className={b('item', {view})}
                    onClick={onAction({
                        action: TabActionType.ChangeChosen,
                        index: itemIndex,
                    })}
                    key={itemIndex}
                    data-qa={TabMenuQA.Item}
                >
                    <div className={b('item-content')}>
                        <span
                            className={b('item-star')}
                            onClick={onAction({
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
        },
        [view, onAction],
    );

    const renderListWithRemove = React.useCallback(
        (items: TabMenuItemData<T>[], selectedItemIndex: number) => {
            return (
                <ListWithRemove
                    list={{
                        items,
                        filterable: false,
                        sortable: true,
                        virtualized: false,
                        selectedItemIndex,
                        className: b('list'),
                        onSortEnd: ({oldIndex, newIndex}) => moveItem(oldIndex, newIndex),
                        renderItem: renderStarListItem,
                        itemClassName: b('list-item', {view}),
                    }}
                    onRemove={onRemove}
                    iconOnHover={true}
                    disableSingleItemRemove={true}
                />
            );
        },
        [moveItem, renderStarListItem, view, onRemove],
    );

    return (
        <div className={b({view}, className)}>
            {enableActionMenu
                ? renderListWithMenu(items, selectedItemIndex, onUpdateItem)
                : renderListWithRemove(items, selectedItemIndex)}
            {renderButtons()}
        </div>
    );
};
