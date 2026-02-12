import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import type {SharedEntry} from '../types';

type SharedBindingsHeaderProps = {
    isDeleteDialog: boolean;
    entry: SharedEntry;
};

const i18n = I18n.keyset('component.dialog-shared-entry-bindings.view');

export const SharedBindingsHeader = ({isDeleteDialog, entry}: SharedBindingsHeaderProps) => {
    const title = isDeleteDialog
        ? i18n('title-dialog-delete', {
              entry: i18n(entry.scope).toLowerCase(),
          })
        : i18n('title-dialog');

    return <Dialog.Header caption={title} />;
};
