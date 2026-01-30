import React from 'react';

import {Dialog, List} from '@gravity-ui/uikit';
import type {ListProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ConnectionsS3BaseQA} from 'shared/constants/qa/connections';

import {ListHeader} from './ListHeader';
import {ListItem} from './ListItem';
import type {DialogS3SourceItem, DialogS3SourcesProps} from './types';
import {getListItems, getNextSelectedItems, isAllActiveItemsSelected} from './utils';

import './DialogS3Source.scss';

const b = block('conn-dialog-s3-source');
const i18n = I18n.keyset('connections.gsheet.view');
const ITEM_HEIGHT = 42;
const DEFAULT_LIMIT = 10;

export const DialogS3Source = (props: DialogS3SourcesProps) => {
    const {sourcesInfo = [], limit = DEFAULT_LIMIT, batch = false, onApply, onClose} = props;
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    const items: DialogS3SourceItem[] = React.useMemo(() => {
        return getListItems({sourcesInfo, selectedItems, limit});
    }, [sourcesInfo, limit, selectedItems]);
    const allActiveItemsSelected = isAllActiveItemsSelected(items);
    const dialogCaption = batch
        ? i18n('label_gsheet-sources-dialog-title-batch')
        : i18n('label_gsheet-sources-dialog-title-single');

    const handleItemClick = React.useCallback(
        (item: DialogS3SourceItem) => {
            let nextSelectedItems: string[] | undefined;

            if (batch) {
                nextSelectedItems = item.selected
                    ? selectedItems.filter((selectedItemId) => {
                          return selectedItemId !== item.source_id;
                      })
                    : [...selectedItems, item.source_id];
            } else if (!item.selected) {
                nextSelectedItems = [item.source_id];
            }

            if (nextSelectedItems) {
                setSelectedItems(nextSelectedItems);
            }
        },
        [batch, selectedItems],
    );

    const handleHeaderCheckboxUpdate = React.useCallback(() => {
        const nextSelectedItems = getNextSelectedItems({items, selectedItems, limit});
        setSelectedItems(nextSelectedItems);
    }, [limit, selectedItems, items]);

    const handleApply = React.useCallback(() => {
        onApply(selectedItems);
    }, [selectedItems, onApply]);

    const renderListItem: NonNullable<ListProps<DialogS3SourceItem>['renderItem']> =
        React.useCallback(
            (item, _isItemActive, itemIndex) => {
                return (
                    <ListItem
                        item={item}
                        batch={batch}
                        qa={`${ConnectionsS3BaseQA.S3_SOURCE_DIALOG_LIST_ITEM}-${itemIndex}`}
                    />
                );
            },
            [batch],
        );

    return (
        <Dialog size="s" open={true} onClose={onClose}>
            <Dialog.Header caption={dialogCaption} />
            <Dialog.Body className={b()}>
                <ListHeader
                    title={i18n('label_lists')}
                    batch={batch}
                    checked={allActiveItemsSelected}
                    indeterminate={Boolean(selectedItems.length && !allActiveItemsSelected)}
                    onUpdate={handleHeaderCheckboxUpdate}
                />
                <List
                    className={b('list-container')}
                    itemHeight={ITEM_HEIGHT}
                    items={items}
                    filterable={false}
                    virtualized={false}
                    onItemClick={handleItemClick}
                    renderItem={renderListItem}
                />
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApply}
                textButtonApply={i18n('button_add')}
                textButtonCancel={i18n('button_cancel')}
                propsButtonApply={{
                    disabled: !selectedItems.length,
                    qa: ConnectionsS3BaseQA.S3_SOURCE_DIALOG_SUBMIT_BUTTON,
                }}
            />
        </Dialog>
    );
};
