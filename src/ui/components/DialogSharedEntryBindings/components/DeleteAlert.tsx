import React from 'react';

import {Alert} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {SharedScope} from 'shared';
import type {SharedEntryBindingsItem} from 'shared/schema';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {DialogClassName} from '../constants';
import type {SharedEntry} from '../types';
import {getRelationText} from '../utils';

type DeleteAlertProps = {
    entry: SharedEntry;
    entities: SharedEntryBindingsItem[];
    isDeleteDialog: boolean;
    isError: boolean;
    isSearchActive: boolean;
};

const b = block(DialogClassName);

export const DeleteAlert = ({
    entities,
    entry,
    isDeleteDialog,
    isError,
    isSearchActive,
}: DeleteAlertProps) => {
    if (!isDeleteDialog || isError || (isSearchActive && entities.length === 0)) {
        return null;
    }

    const title = getSharedEntryMockText(
        entities.length > 0
            ? 'alert-title-warning-bindings-dialog-delete'
            : 'alert-title-info-bindings-dialog-delete',
        {
            entry: getSharedEntryMockText(`label-shared-${entry.scope as SharedScope}`),
            relation: getRelationText(entities),
        },
    );
    const message = getSharedEntryMockText(
        entities.length > 0
            ? 'alert-message-warning-bindings-dialog-delete'
            : 'alert-message-info-bindings-dialog-delete',
    );
    const theme = entities.length > 0 ? 'warning' : 'info';

    return (
        <Alert
            className={b('info', {'empty-list': entities.length === 0})}
            theme={theme}
            title={title}
            message={message}
        />
    );
};
