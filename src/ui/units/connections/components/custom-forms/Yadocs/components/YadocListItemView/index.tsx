import React from 'react';

import type {HandleItemClick, YadocListItem} from '../../types';

import {UploadedYadocView} from './UploadedYadocView';
import {YadocSourceInfoView} from './YadocSourceInfoView';
import {YadocSourceView} from './YadocSourceView';

type GSheetListItemViewProps = {
    item: YadocListItem;
    deleteListItem?: HandleItemClick;
    clickErrorAction?: HandleItemClick;
    clickRenameAction?: HandleItemClick;
    clickReplaceAction?: HandleItemClick;
};

export const YadocListItemView = (props: GSheetListItemViewProps) => {
    const {item, deleteListItem, clickErrorAction, clickRenameAction, clickReplaceAction} = props;

    switch (item.type) {
        case 'uploadedYadoc': {
            return (
                <UploadedYadocView
                    item={item}
                    deleteListItem={deleteListItem}
                    clickErrorAction={clickErrorAction}
                />
            );
        }
        case 'yadocSourceInfo': {
            return <YadocSourceInfoView item={item} deleteListItem={deleteListItem} />;
        }
        case 'yadocEditableSource':
        case 'yadocReadonlySource': {
            return (
                <YadocSourceView
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
