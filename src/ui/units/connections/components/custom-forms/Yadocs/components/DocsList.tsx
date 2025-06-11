import React from 'react';

import {Plus} from '@gravity-ui/icons';
import {Button, Icon, List} from '@gravity-ui/uikit';
import type {ListProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ConnectionsS3BaseQA, ConnectionsYadocsQA} from 'shared/constants/qa/connections';
import type {YadocItem} from 'ui/units/connections/store';

import {YadocListItemView} from '../components';
import type {HandleItemClick, YadocListItem} from '../types';

const b = block('conn-form-yadocs');
const i18n = I18n.keyset('connections.yadocs.view');
const ITEM_HEIGHT = 52;

type Props = {
    items: YadocItem[];
    selectedItemIndex: number;
    clickAddDocumentButton: () => void;
    clickErrorAction: HandleItemClick;
    clickListItem: HandleItemClick;
    clickRenameAction: HandleItemClick;
    clickReplaceAction: HandleItemClick;
    deleteListItem: HandleItemClick;
};

export const DocsList = (props: Props) => {
    const {
        items,
        selectedItemIndex,
        clickAddDocumentButton,
        clickErrorAction,
        clickListItem,
        clickRenameAction,
        clickReplaceAction,
        deleteListItem,
    } = props;

    const renderItem: NonNullable<ListProps<YadocListItem>['renderItem']> = React.useCallback(
        (item, _isItemActive, itemIndex) => {
            return (
                <YadocListItemView
                    item={item}
                    clickErrorAction={clickErrorAction}
                    clickRenameAction={clickRenameAction}
                    clickReplaceAction={clickReplaceAction}
                    deleteListItem={deleteListItem}
                    qa={`${ConnectionsS3BaseQA.LIST_ITEM}-${itemIndex}`}
                />
            );
        },
        [clickErrorAction, clickRenameAction, clickReplaceAction, deleteListItem],
    );

    return (
        <div className={b('list')} data-qa={ConnectionsYadocsQA.LIST_SECTION}>
            <List
                className={b('list-container')}
                itemClassName={b('list-item-wrap')}
                itemHeight={ITEM_HEIGHT}
                items={items}
                selectedItemIndex={selectedItemIndex}
                filterable={false}
                virtualized={false}
                renderItem={renderItem}
                onItemClick={clickListItem}
            />
            <div className={b('add-section')}>
                <Button
                    view="outlined"
                    onClick={clickAddDocumentButton}
                    qa={ConnectionsYadocsQA.ADD_DOCUMENT_BUTTON}
                >
                    <Icon data={Plus} size={14} />
                    {i18n('label_add-file')}
                </Button>
            </div>
        </div>
    );
};
