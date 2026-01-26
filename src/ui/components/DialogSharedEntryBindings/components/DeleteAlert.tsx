import React from 'react';

import {Alert} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {CollectionItemEntities} from 'shared';
import type {SharedEntryBindingsItem} from 'shared/schema';

import {DialogClassName} from '../constants';
import type {SharedEntry} from '../types';

type DeleteAlertProps = {
    entry: SharedEntry;
    entities: SharedEntryBindingsItem[];
    isDeleteDialog: boolean;
    isError: boolean;
    isSearchActive: boolean;
};

const i18n = I18n.keyset('component.dialog-shared-entry-bindings.view');
const b = block(DialogClassName);

export const getRelationText = (entities: SharedEntryBindingsItem[]) => {
    const hasEntry = entities.some((e) => e.entity === CollectionItemEntities.ENTRY);
    const hasWorkbook = entities.some((e) => e.entity === CollectionItemEntities.WORKBOOK);

    if (hasEntry && hasWorkbook) {
        return i18n('relations-delete');
    } else if (hasEntry) {
        return i18n('relation-dataset-delete');
    } else if (hasWorkbook) {
        return i18n('relation-workbook-delete');
    } else {
        return '';
    }
};

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

    const title = i18n(entities.length > 0 ? 'alert-title-warning' : 'alert-title-info', {
        entry: i18n(entry.scope),
        relation: getRelationText(entities),
    });
    const message = i18n(entities.length > 0 ? 'alert-message-warning' : 'alert-message-info');
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
