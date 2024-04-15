import React from 'react';

import {Copy, CopyArrowRight, FontCursor, TrashBin} from '@gravity-ui/icons';
import {DropdownMenu, DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import {ConnectorType} from 'shared/constants/connections';
import {WorkbookPage} from 'shared/constants/qa/workbooks';
import type {WorkbookWithPermissions} from 'shared/schema/us/types';
import {EntryScope} from 'shared/types/common';
import {S3_BASED_CONNECTORS} from 'ui/constants';
import Utils from 'ui/utils';

import {DropdownAction} from '../../../../components/DropdownAction/DropdownAction';
import {registry} from '../../../../registry';
import type {WorkbookEntry} from '../../types';

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

    const isConnection = entry.scope === EntryScope.Connection;
    const isS3BasedConnector = S3_BASED_CONNECTORS.includes(entry.type as ConnectorType);

    const isFileConnection = isConnection && isS3BasedConnector;

    const items: DropdownMenuItemMixed<unknown>[] = [
        {
            action: onRenameClick,
            text: <DropdownAction icon={FontCursor} text={i18n('action_rename')} />,
        },

        ...(isFileConnection === false
            ? [
                  {
                      action: onDuplicateEntry,
                      text: <DropdownAction icon={Copy} text={i18n('action_duplicate')} />,
                      qa: WorkbookPage.MenuItemDuplicate,
                  },
              ]
            : []),
        ...(!isFileConnection && copyEntriesToWorkbookEnabled
            ? [
                  {
                      action: onCopyEntry,
                      text: <DropdownAction icon={CopyArrowRight} text={i18n('action_copy')} />,
                  },
              ]
            : []),
        ...useAdditionalWorkbookEntryActions(entry, workbook),
    ];

    const otherActions: DropdownMenuItemMixed<unknown>[] = [];

    otherActions.push([
        {
            action: onDeleteClick,
            text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
            theme: 'danger',
        },
    ]);

    items.push(...otherActions);

    return (
        <DropdownMenu
            size="m"
            items={items}
            defaultSwitcherProps={{qa: WorkbookPage.MenuDropDownBtn}}
        />
    );
};
