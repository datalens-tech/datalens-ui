import React from 'react';

import {Plus} from '@gravity-ui/icons';
import {Button, Icon, List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {YadocItem} from 'ui/units/connections/store';

import {YadocListItemView} from '../components';
import {i18n8857} from '../constants';
import type {HandleItemClick, YadocListItem} from '../types';

const b = block('conn-form-yadocs');
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

    const renderItem = React.useCallback(
        (item: YadocListItem) => {
            return (
                <YadocListItemView
                    item={item}
                    clickErrorAction={clickErrorAction}
                    clickRenameAction={clickRenameAction}
                    clickReplaceAction={clickReplaceAction}
                    deleteListItem={deleteListItem}
                />
            );
        },
        [clickErrorAction, clickRenameAction, clickReplaceAction, deleteListItem],
    );

    return (
        <div className={b('list')}>
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
                <Button view="outlined" onClick={clickAddDocumentButton}>
                    <Icon data={Plus} size={14} />
                    {i18n8857['label_add-document']}
                </Button>
            </div>
        </div>
    );
};
