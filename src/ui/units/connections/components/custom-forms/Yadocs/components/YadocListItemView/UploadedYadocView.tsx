import React from 'react';

import {I18n} from 'i18n';
import {parseError} from 'ui/utils/errors/parse';

import {ConverterErrorCode} from '../../../../../constants';
import type {UploadedYadoc} from '../../../../../store';
import type {ListItemAction} from '../../../components';
import {ListItem} from '../../../components';
import type {HandleItemClick} from '../../types';

const i18n = I18n.keyset('connections.gsheet.view');

type UploadedYadocViewProps = {
    item: UploadedYadoc;
    deleteListItem?: HandleItemClick;
    clickErrorAction?: HandleItemClick;
    qa?: string;
};

// Forbids retry because of ...
const CODES_FORBIDING_RETRIES = [
    // ... user should go through the authentication flow from start
    ConverterErrorCode.PERMISSION_DENIED,
    // ... uselessness of this action in case of unsupported document
    ConverterErrorCode.UNSUPPORTED_DOCUMENT,
];

const UploadedYadocViewComponent = (props: UploadedYadocViewProps) => {
    const {item, deleteListItem, clickErrorAction, qa} = props;
    const actions: ListItemAction<UploadedYadocViewProps['item']>[] = React.useMemo(() => {
        const nextActions: ListItemAction<UploadedYadocViewProps['item']>[] = [
            {type: 'delete', item, onClick: deleteListItem},
        ];

        if (item.status === 'failed') {
            const parsedError = item.error && parseError(item.error);
            const code = parsedError?.code || '';
            const onClick = CODES_FORBIDING_RETRIES.includes(code) ? undefined : clickErrorAction;
            nextActions.splice(0, 0, {
                type: 'error',
                item,
                message: i18n('label_gsheet-failed'),
                onClick,
            });
        }

        return nextActions;
    }, [item, deleteListItem, clickErrorAction]);

    let description: string | undefined;

    switch (item.status) {
        case 'ready': {
            description = i18n('label_gsheet-ready');
            break;
        }
        case 'in_progress': {
            description = i18n('label_uploading');
            break;
        }
    }

    return <ListItem title={item.data.title} description={description} actions={actions} qa={qa} />;
};

export const UploadedYadocView = React.memo(UploadedYadocViewComponent);
