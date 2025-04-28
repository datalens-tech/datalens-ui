import React from 'react';

import type {PopupProps} from '@gravity-ui/uikit';
import {Button, Dialog, List, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DashTabItem, DashTabLayout} from 'shared';
import {DialogTabsQA, EntryDialogQA} from 'shared';
import {registry} from 'ui/registry';

import {getGroupedItems, getLayoutMap, sortByLayoutComparator} from '../../../../modules/helpers';

import {getUpdatedItems, getWidgetRowText} from './helpers';

import './PopupWidgetsOrder.scss';

interface PopupWidgetsOrderProps {
    onClose: () => void;
    onApply: (params: {tabId: string; items: Array<DashTabItem>}) => void;
    anchorRef: PopupProps['anchorRef'];
    items: Array<DashTabItem>;
    layout: Array<DashTabLayout>;
    tabId: string;
}

const i18n = I18n.keyset('dash.popup-widgets-order.view');
const b = block('widgets-order-popup');

const LIST_PREFIX_TEXTS = {
    title: i18n('label_title'),
    text: i18n('label_text'),
    control: i18n('label_control'),
    group_control: i18n('label_group_control'),
    widget: i18n('label_widget'),
    image: i18n('label_image'),
};

const ROW_HEIGHT = 34;

const WidgetRow = (item: DashTabItem) => {
    const typeLabel = LIST_PREFIX_TEXTS[item.type];
    const text = getWidgetRowText(item);

    return (
        <div title={text} key={`widget-order-item-${item.id}`} className={b('widget-title')}>
            {typeLabel}: {text}
        </div>
    );
};

export const PopupWidgetsOrder = (props: PopupWidgetsOrderProps) => {
    const {anchorRef, onClose, onApply, items, layout, tabId} = props;
    const [groupedItems, setGroupedItems] = React.useState<Array<Array<DashTabItem>>>([]);
    const isApplyDisabled = items.length <= 1;

    React.useEffect(() => {
        setGroupedItems(getGroupedItems(items, layout));
    }, [items, layout]);

    const handleOnSortEnd = React.useCallback(
        (groupIndex, {oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
            if (oldIndex === newIndex) {
                return;
            }
            const groupItems = groupedItems[groupIndex];

            const newItems = getUpdatedItems({
                items: groupItems,
                dragItem: groupItems[oldIndex],
                oldIndex,
                newIndex,
            });
            const clone = [...groupedItems];
            clone[groupIndex] = newItems;

            setGroupedItems(clone);
        },
        [groupedItems],
    );

    const handleResetToDefaultClick = React.useCallback(() => {
        const [layoutMap, layoutColumns] = getLayoutMap(layout);

        const sortedItemsByDefault = items.sort((prevItem, nextItem) =>
            sortByLayoutComparator(prevItem, nextItem, layoutMap, layoutColumns),
        );

        const newItems = sortedItemsByDefault.map((item, index) => {
            return {
                ...item,
                orderId: index,
                defaultOrderId: index,
            };
        });

        setGroupedItems(getGroupedItems(newItems, layout));
    }, [items, layout]);

    const handleApplyClick = () => {
        const itemsLayoutOrder = layout.reduce<Record<string, number>>((memo, item, index) => {
            memo[item.i] = index;

            return memo;
        }, {});

        const sortedItems = groupedItems
            .reduce((memo, group) => {
                memo.push(...group);
                return memo;
            }, [])
            .sort((a, b) => itemsLayoutOrder[a.id] - itemsLayoutOrder[b.id]);

        onApply({
            tabId,
            items: sortedItems,
        });
    };

    const {getCaptionText} = registry.dash.functions.getAll();
    const captionText = getCaptionText() || '';
    return (
        <Popup
            anchorRef={anchorRef}
            open={true}
            placement="right-start"
            offset={[-20, 10]}
            onClose={onClose}
            modifiers={[
                {
                    name: 'flip',
                    options: {fallbackPlacements: ['bottom-start', 'bottom', 'right-start']},
                },
            ]}
            contentClassName={b('popover')}
            qa={DialogTabsQA.PopupWidgetOrder}
        >
            <Dialog.Header className={b('header')} caption={captionText} />
            <div className={b('body')}>
                <div className={b('list')}>
                    {groupedItems.map((preparedItems, index) => {
                        if (preparedItems.length) {
                            return (
                                <List
                                    key={`list_${index}`}
                                    filterable={false}
                                    virtualized={false}
                                    sortable={preparedItems.length > 1}
                                    items={preparedItems}
                                    className={b('group-list')}
                                    itemClassName={b('row')}
                                    // Fix in @gravity-ui 7
                                    itemsHeight={preparedItems.length * ROW_HEIGHT}
                                    onSortEnd={handleOnSortEnd.bind(this, index)}
                                    renderItem={WidgetRow}
                                    qa={DialogTabsQA.PopupWidgetOrderList}
                                />
                            );
                        }

                        return null;
                    })}
                    {groupedItems.every((list) => list.length === 0) && (
                        <div>{i18n('label_no-items')}</div>
                    )}
                </div>
            </div>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApplyClick}
                propsButtonApply={{
                    qa: EntryDialogQA.Apply,
                    disabled: isApplyDisabled,
                }}
                propsButtonCancel={{
                    qa: EntryDialogQA.Cancel,
                    disabled: isApplyDisabled,
                }}
                textButtonApply={i18n('button_apply')}
                textButtonCancel={i18n('button_cancel')}
            >
                <React.Fragment>
                    {!isApplyDisabled && (
                        <div className={b('controls-bottom')}>
                            <Button
                                view="outlined"
                                size="l"
                                onClick={handleResetToDefaultClick}
                                qa={EntryDialogQA.Reset}
                            >
                                {i18n('button_make-default')}
                            </Button>
                        </div>
                    )}
                </React.Fragment>
            </Dialog.Footer>
        </Popup>
    );
};
