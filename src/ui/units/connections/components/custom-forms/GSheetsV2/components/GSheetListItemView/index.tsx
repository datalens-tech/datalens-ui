import React from 'react';

import type {GSheetListItem, HandleItemClick} from '../../types';

import {GSheetSourceInfoView} from './GSheetSourceInfoView';
import {GSheetSourceView} from './GSheetSourceView';
import {UploadedGSheetView} from './UploadedGSheetView';

type GSheetListItemViewProps = {
    item: GSheetListItem;
    deleteListItem: HandleItemClick;
    clickErrorAction: HandleItemClick;
    clickRenameAction: HandleItemClick;
    clickReplaceAction: HandleItemClick;
};

export const GSheetListItemView = (props: GSheetListItemViewProps) => {
    const {item, deleteListItem, clickErrorAction, clickRenameAction, clickReplaceAction} = props;

    switch (item.type) {
        case 'uploadedGSheet': {
            return (
                <UploadedGSheetView
                    item={item}
                    deleteListItem={deleteListItem}
                    clickErrorAction={clickErrorAction}
                />
            );
        }
        case 'gsheetSourceInfo': {
            return (
                <GSheetSourceInfoView
                    item={item}
                    deleteListItem={deleteListItem}
                    clickErrorAction={clickErrorAction}
                />
            );
        }
        case 'gsheetEditableSource':
        case 'gsheetReadonlySource': {
            return (
                <GSheetSourceView
                    item={item}
                    deleteListItem={deleteListItem}
                    clickErrorAction={clickErrorAction}
                    clickRenameAction={clickRenameAction}
                    clickReplaceAction={clickReplaceAction}
                />
            );
        }
        default: {
            return null;
        }
    }
};
