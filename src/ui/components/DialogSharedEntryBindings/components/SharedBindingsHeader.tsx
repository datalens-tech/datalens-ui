import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import type {SharedScope} from 'shared';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import type {SharedEntry} from '../types';

type SharedBindingsHeaderProps = {
    isDeleteDialog: boolean;
    entry: SharedEntry;
};

export const SharedBindingsHeader = ({isDeleteDialog, entry}: SharedBindingsHeaderProps) => {
    const title = isDeleteDialog
        ? getSharedEntryMockText('title-bindings-dialog-delete', {
              entry: getSharedEntryMockText(
                  `label-shared-${entry.scope as SharedScope}`,
              ).toLowerCase(),
          })
        : getSharedEntryMockText('title-bindings-dialog');

    return <Dialog.Header caption={title} />;
};
