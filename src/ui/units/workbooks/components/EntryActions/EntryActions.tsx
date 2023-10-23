import React from 'react';

import {DropdownMenu, DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema/us/types';
import {EntryScope} from 'shared/types/common';
import Utils from 'ui/utils';

import {registry} from '../../../../registry';
import {WorkbookEntry} from '../../types';

const i18n = I18n.keyset('new-workbooks');

const copyEntriesToWorkbookEnabled = Utils.isEnabledFeature(Feature.CopyEntriesToWorkbook);

type EntryActionsProps = {
    workbook: WorkbookWithPermissions;
    entry: WorkbookEntry;
    onRenameClick: () => void;
    onDeleteClick: () => void;
    onDuplicateEntry: () => void;
    onCopyEntry: () => void;
};

export const EntryActions = ({
    workbook,
    entry,
    onRenameClick,
    onDeleteClick,
    onDuplicateEntry,
    onCopyEntry,
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
        ...(!(entry.scope === EntryScope.Connection && entry.type === 'file') &&
        copyEntriesToWorkbookEnabled
            ? [
                  {
                      action: onCopyEntry,
                      text: i18n('action_copy'),
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
