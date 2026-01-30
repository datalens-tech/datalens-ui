import React from 'react';

import {I18n} from 'i18n';

import type {YadocSource} from '../../../../../store';
import type {ListItemAction} from '../../../components';
import {ListItem} from '../../../components';
import type {HandleItemClick} from '../../types';

const i18n = I18n.keyset('connections.gsheet.view');

type YadocSourceViewProps = {
    item: YadocSource;
    deleteListItem?: HandleItemClick;
    clickErrorAction?: HandleItemClick;
    clickRenameAction?: HandleItemClick;
    clickReplaceAction?: HandleItemClick;
    qa?: string;
};

const YadocSourceViewComponent = (props: YadocSourceViewProps) => {
    const {item, deleteListItem, clickErrorAction, clickRenameAction, clickReplaceAction, qa} =
        props;
    const actions: ListItemAction<YadocSource>[] | undefined = React.useMemo(() => {
        let nextActions: ListItemAction<YadocSource>[] | undefined;

        switch (item.status) {
            case 'in_progress': {
                nextActions = [{type: 'delete', item, onClick: deleteListItem}];
                break;
            }
            case 'ready': {
                nextActions = [
                    {
                        type: 'more',
                        item,
                        onDelete: deleteListItem,
                        onRename: clickRenameAction,
                        onReplace: clickReplaceAction,
                    },
                ];
                break;
            }
            case 'failed': {
                nextActions = [
                    {
                        type: 'error',
                        item,
                        message: i18n('label_source-failed'),
                        onClick: clickErrorAction,
                    },
                    {type: 'delete', item, onClick: deleteListItem},
                ];
            }
        }

        return nextActions;
    }, [item, deleteListItem, clickErrorAction, clickRenameAction, clickReplaceAction]);
    const title = item.type === 'yadocEditableSource' ? item.data.source.title : item.data.title;

    return <ListItem title={title} actions={actions} qa={qa} />;
};

export const YadocSourceView = React.memo(YadocSourceViewComponent);
