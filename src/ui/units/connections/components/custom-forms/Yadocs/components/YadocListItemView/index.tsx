import React from 'react';

import type {HandleItemClick, YadocListItem} from '../../types';

import {UploadedYadocView} from './UploadedYadocView';
import {YadocSourceInfoView} from './YadocSourceInfoView';
import {YadocSourceView} from './YadocSourceView';

type YadocListItemViewProps = {
    item: YadocListItem;
    deleteListItem?: HandleItemClick;
    clickErrorAction?: HandleItemClick;
    clickRenameAction?: HandleItemClick;
    clickReplaceAction?: HandleItemClick;
    qa?: string;
};

export const YadocListItemView = (props: YadocListItemViewProps) => {
    const {item, deleteListItem, clickErrorAction, clickRenameAction, clickReplaceAction, qa} =
        props;

    switch (item.type) {
        case 'uploadedYadoc': {
            return (
                <UploadedYadocView
                    item={item}
                    deleteListItem={deleteListItem}
                    clickErrorAction={clickErrorAction}
                    qa={qa}
                />
            );
        }
        case 'yadocSourceInfo': {
            return <YadocSourceInfoView item={item} deleteListItem={deleteListItem} qa={qa} />;
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
                    qa={qa}
                />
            );
        }
        default: {
            return null;
        }
    }
};
