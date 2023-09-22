import React from 'react';

import {List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {GSheetAddSectionState} from '../../../../store';
import type {
    AddGoogleSheet,
    GSheetListItem,
    HandleItemClick,
    UpdateAddSectionState,
} from '../types';

import {AddSection} from './AddSection';
import {GSheetListItemView} from './GSheetListItemView';

const b = block('conn-form-gsheets');
const ITEM_HEIGHT = 52;

type SheetsListProps = {
    addSectionState: GSheetAddSectionState;
    listItems: GSheetListItem[];
    selectedItemIndex: number;
    addGoogleSheet: AddGoogleSheet;
    updateAddSectionState: UpdateAddSectionState;
    clickListItem: HandleItemClick;
    deleteListItem: HandleItemClick;
    clickErrorAction: HandleItemClick;
    clickRenameAction: HandleItemClick;
    clickReplaceAction: HandleItemClick;
};

export const SheetsList = (props: SheetsListProps) => {
    const {
        addSectionState,
        listItems,
        selectedItemIndex,
        addGoogleSheet,
        updateAddSectionState,
        clickListItem,
        deleteListItem,
        clickErrorAction,
        clickRenameAction,
        clickReplaceAction,
    } = props;

    const renderItem = React.useCallback(
        (item: GSheetListItem) => {
            return (
                <GSheetListItemView
                    item={item}
                    deleteListItem={deleteListItem}
                    clickErrorAction={clickErrorAction}
                    clickRenameAction={clickRenameAction}
                    clickReplaceAction={clickReplaceAction}
                />
            );
        },
        [deleteListItem, clickErrorAction, clickRenameAction, clickReplaceAction],
    );

    return (
        <div className={b('list')}>
            <List
                className={b('list-container')}
                itemClassName={b('list-item-wrap')}
                itemHeight={ITEM_HEIGHT}
                items={listItems}
                selectedItemIndex={selectedItemIndex}
                filterable={false}
                virtualized={false}
                renderItem={renderItem}
                onItemClick={clickListItem}
            />
            <AddSection
                {...addSectionState}
                addGoogleSheet={addGoogleSheet}
                updateAddSectionState={updateAddSectionState}
            />
        </div>
    );
};
