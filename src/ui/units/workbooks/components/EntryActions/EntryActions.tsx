import React from 'react';

import {CodeTrunk, Copy, CopyArrowRight, FontCursor, TrashBin} from '@gravity-ui/icons';
import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {DropdownMenu} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import type {ConnectorType} from 'shared/constants/connections';
import {WorkbookPageQa} from 'shared/constants/qa/workbooks';
import type {WorkbookWithPermissions} from 'shared/schema/us/types';
import {EntryScope} from 'shared/types/common';
import {S3_BASED_CONNECTORS} from 'ui/constants';
import Utils from 'ui/utils';

import {DropdownAction} from '../../../../components/DropdownAction/DropdownAction';
import {registry} from '../../../../registry';
import type {WorkbookEntry} from '../../types';

const i18n = I18n.keyset('new-workbooks');
const commonMenuI18n = I18n.keyset('component.entry-context-menu.view');

const copyEntriesToWorkbookEnabled = Utils.isEnabledFeature(Feature.CopyEntriesToWorkbook);

type EntryActionsProps = {
    workbook: WorkbookWithPermissions;
    entry: WorkbookEntry;
    onRenameClick: () => void;
    onDeleteClick: () => void;
    onDuplicateEntry: () => void;
    onCopyEntry: () => void;
    onShowRelatedClick: () => void;
};

export const EntryActions = ({
    workbook,
    entry,
    onRenameClick,
    onDeleteClick,
    onDuplicateEntry,
    onCopyEntry,
    onShowRelatedClick,
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
                      qa: WorkbookPageQa.MenuItemDuplicate,
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
        [
            {
                action: onShowRelatedClick,
                text: (
                    <DropdownAction
                        icon={CodeTrunk}
                        text={commonMenuI18n('value_show-related-entities')}
                    />
                ),
            },
        ],
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
            defaultSwitcherProps={{qa: WorkbookPageQa.MenuDropDownBtn}}
        />
    );
};
