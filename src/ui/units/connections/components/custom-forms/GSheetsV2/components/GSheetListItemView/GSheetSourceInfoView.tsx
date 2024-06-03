import React from 'react';

import {I18n} from 'i18n';

import type {GSheetSourceInfo} from '../../../../../store';
import type {ListItemAction} from '../../../components';
import {ListItem} from '../../../components';
import type {HandleItemClick} from '../../types';

const i18n = I18n.keyset('connections.gsheet.view');

type GSheetSourceInfoViewProps = {
    item: GSheetSourceInfo;
    deleteListItem: HandleItemClick;
    clickErrorAction: HandleItemClick;
};

const GSheetSourceInfoViewComponent = (props: GSheetSourceInfoViewProps) => {
    const {item, deleteListItem} = props;
    const actions: ListItemAction<GSheetSourceInfoViewProps['item']>[] | undefined =
        React.useMemo(() => {
            let nextActions: ListItemAction<GSheetSourceInfoViewProps['item']>[] | undefined;

            switch (item.status) {
                case 'in_progress': {
                    nextActions = [{type: 'delete', item, onClick: deleteListItem}];
                    break;
                }
                case 'failed': {
                    nextActions = [
                        {
                            type: 'error',
                            item,
                            message: i18n('label_source-info-failed'),
                            // commented until the backend learns to return 403 in this place
                            // onClick: clickErrorAction,
                        },
                        {type: 'delete', item, onClick: deleteListItem},
                    ];
                }
            }

            return nextActions;
        }, [item, deleteListItem]);

    const description = item.status === 'in_progress' ? i18n('label_uploading') : undefined;

    return <ListItem title={item.data.title} description={description} actions={actions} />;
};

export const GSheetSourceInfoView = React.memo(GSheetSourceInfoViewComponent);
