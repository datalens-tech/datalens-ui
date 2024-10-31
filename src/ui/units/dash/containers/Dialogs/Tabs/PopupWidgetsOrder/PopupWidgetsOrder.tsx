import React from 'react';

import type {PopupProps} from '@gravity-ui/uikit';
import {Button, Dialog, List, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {cloneDeep} from 'lodash';
import type {DashTabItem, DashTabLayout} from 'shared';
import {DialogTabsQA, EntryDialogQA} from 'shared';
import {registry} from 'ui/registry';

import {getLayoutMap, sortByLayoutComparator} from '../../../../modules/helpers';

import {getPreparedItems, getUpdatedItems, getWidgetRowText} from './helpers';

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
    const [preparedItems, setPreparedItems] = React.useState<Array<DashTabItem>>([]);
    const isApplyDisabled = preparedItems.length <= 1;

    React.useEffect(() => {
        if (items?.length) {
            setPreparedItems(getPreparedItems(cloneDeep(items), layout));
        }
    }, [items]);

    const handleOnSortEnd = React.useCallback(
        ({oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
            if (oldIndex === newIndex) {
                return;
            }

            const newItems = getUpdatedItems({
                items: preparedItems,
                dragItem: preparedItems[oldIndex],
                oldIndex,
                newIndex,
            });

            setPreparedItems(newItems);
        },
        [preparedItems],
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

        setPreparedItems(newItems);
    }, [preparedItems]);

    const handleApplyClick = () => {
        onApply({tabId, items: preparedItems});
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
                {preparedItems?.length ? (
                    <List
                        filterable={false}
                        virtualized={false}
                        sortable={true}
                        items={preparedItems}
                        className={b('list')}
                        itemClassName={b('row')}
                        onSortEnd={handleOnSortEnd}
                        renderItem={WidgetRow}
                        qa={DialogTabsQA.PopupWidgetOrderList}
                    />
                ) : (
                    <div>{i18n('label_no-items')}</div>
                )}
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
