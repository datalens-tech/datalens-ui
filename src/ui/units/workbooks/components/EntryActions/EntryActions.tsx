import React from 'react';

import {DropdownMenu, DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {WorkbookWithPermissions} from 'shared/schema/us/types';
import {EntryScope} from 'shared/types/common';

import {registry} from '../../../../registry';
import {WorkbookEntry} from '../../types';

const i18n = I18n.keyset('new-workbooks');

type EntryActionsProps = {
    workbook: WorkbookWithPermissions;
    entry: WorkbookEntry;
    onRenameClick: () => void;
    onDeleteClick: () => void;
    onDuplicateEntry: () => void;
};

export const EntryActions = ({
    workbook,
    entry,
    onRenameClick,
    onDeleteClick,
    onDuplicateEntry,
}: EntryActionsProps) => {
    const {useAdditionalWorkbookEntryActions} = registry.workbooks.functions.getAll();

    const items: DropdownMenuItemMixed<unknown>[] = [
        {
            action: onRenameClick,
            text: i18n('action_rename'),
        },
        ...(entry.scope !== EntryScope.Connection && entry.scope !== EntryScope.Dataset
            ? [
                  {
                      action: onDuplicateEntry,
                      text: i18n('action_duplicate'),
                  },
              ]
            : []),
        ...useAdditionalWorkbookEntryActions(entry, workbook),
        {
            action: onDeleteClick,
            text: i18n('action_delete'),
            theme: 'danger',
        },
    ];

    return <DropdownMenu size="s" items={items} />;
};
