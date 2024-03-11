import React from 'react';

import {I18n} from 'i18n';

import type {YadocSourceInfo} from '../../../../../store';
import {ListItem, ListItemAction} from '../../../components';
import type {HandleItemClick} from '../../types';

const i18n = I18n.keyset('connections.gsheet.view');

type YadocSourceInfoViewProps = {
    item: YadocSourceInfo;
    deleteListItem?: HandleItemClick;
};

const YadocSourceInfoViewComponent = (props: YadocSourceInfoViewProps) => {
    const {item, deleteListItem} = props;
    const actions: ListItemAction<YadocSourceInfoViewProps['item']>[] | undefined =
        React.useMemo(() => {
            let nextActions: ListItemAction<YadocSourceInfoViewProps['item']>[] | undefined;

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

export const YadocSourceInfoView = React.memo(YadocSourceInfoViewComponent);
