import React from 'react';

import {I18n} from 'i18n';

import type {GSheetSource} from '../../../../../store';
import type {ListItemAction} from '../../../components';
import {ListItem} from '../../../components';
import type {HandleItemClick} from '../../types';

const i18n = I18n.keyset('connections.gsheet.view');

type GSheetSourceViewProps = {
    item: GSheetSource;
    deleteListItem: HandleItemClick;
    clickErrorAction: HandleItemClick;
    clickRenameAction: HandleItemClick;
    clickReplaceAction: HandleItemClick;
};

const GSheetSourceViewComponent = (props: GSheetSourceViewProps) => {
    const {item, deleteListItem, clickErrorAction, clickRenameAction, clickReplaceAction} = props;
    const actions: ListItemAction<GSheetSource>[] | undefined = React.useMemo(() => {
        let nextActions: ListItemAction<GSheetSource>[] | undefined;

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
    const title = item.type === 'gsheetEditableSource' ? item.data.source.title : item.data.title;

    return <ListItem title={title} actions={actions} />;
};

export const GSheetSourceView = React.memo(GSheetSourceViewComponent);
