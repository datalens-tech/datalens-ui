import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import type {ButtonSize, ButtonView} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {CollectionItemEntities, CreateEntityButton, EntryScope, Feature} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';
import {DIALOG_SELECT_SHARED_ENTRY} from 'ui/components/DialogSelectSharedEntry/DialogSelectSharedEntry';
import {DIALOG_SHARED_ENTRY_PERMISSIONS} from 'ui/components/DialogSharedEntryPermissions/DialogSharedEntryPermissions';
import {registry} from 'ui/registry';
import type {AppDispatch} from 'ui/store';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {showToast} from 'ui/store/actions/toaster';
import {getSharedEntriesMenuItems} from 'ui/units/collections/components/CollectionActions/utils';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';
import Utils from 'ui/utils';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {CreateEntryActionType} from '../../constants';
import {
    bindSharedEntryToWorkbook,
    getWorkbookSharedEntries,
    setCreateWorkbookEntryType,
} from '../../store/actions';
import {selectWorkbookFilters} from '../../store/selectors';

import './CreateEntry.scss';

type Props = {
    scope?: EntryScope;
    className?: string;
    workbook?: WorkbookWithPermissions;
    size?: ButtonSize;
    view?: ButtonView;
};

const b = block('dl-workbook-create-entry');

export const CreateEntry = React.memo<Props>(
    ({className, workbook, scope, size = 'm', view = 'normal'}) => {
        const dispatch = useDispatch<AppDispatch>();
        const filters = useSelector(selectWorkbookFilters);
        const handleAction = (type: CreateEntryActionType) => {
            dispatch(setCreateWorkbookEntryType(type));
        };

        const handleSharedEntryAction = React.useCallback(
            (
                scope: EntryScope.Dataset | EntryScope.Connection,
                collectionId: string,
                workbookId: string,
            ) =>
                () =>
                    dispatch(
                        openDialog({
                            id: DIALOG_SELECT_SHARED_ENTRY,
                            props: {
                                open: true,
                                onClose: () => dispatch(closeDialog()),
                                collectionId,
                                dialogTitle: getSharedEntryMockText(
                                    `title-select-shared-entry-dialog-${scope}`,
                                ),
                                onSelectEntry: (entry) => {
                                    dispatch(
                                        openDialog({
                                            id: DIALOG_SHARED_ENTRY_PERMISSIONS,
                                            props: {
                                                open: true,
                                                onClose: () => dispatch(closeDialog()),
                                                entry,
                                                onApply: async (delegation) => {
                                                    const success = await dispatch(
                                                        bindSharedEntryToWorkbook({
                                                            sourceId: entry.entryId,
                                                            targetId: workbookId,
                                                            delegation,
                                                        }),
                                                    );
                                                    if (success) {
                                                        dispatch(closeDialog());
                                                        dispatch(closeDialog());

                                                        const entries = await dispatch(
                                                            getWorkbookSharedEntries({
                                                                scope,
                                                                workbookId,
                                                                filters,
                                                            }),
                                                        );

                                                        const addedEntry = entries?.entries.find(
                                                            (item) =>
                                                                item.entryId === entry.entryId,
                                                        );

                                                        dispatch(
                                                            showToast({
                                                                type: 'success',
                                                                title: getSharedEntryMockText(
                                                                    `add-entry-workbook-toast-title-${scope}`,
                                                                ),
                                                                content: getSharedEntryMockText(
                                                                    'add-entry-workbook-toast-message',
                                                                    {
                                                                        name: Utils.getEntryNameFromKey(
                                                                            addedEntry?.key ?? '',
                                                                        ),
                                                                    },
                                                                ),
                                                            }),
                                                        );
                                                    }
                                                },
                                            },
                                        }),
                                    );
                                },
                                getIsInactiveEntity: (entry) =>
                                    entry.entity === CollectionItemEntities.ENTRY &&
                                    entry.scope !== scope,
                            },
                        }),
                    ),
            [dispatch, filters],
        );

        const {useCreateEntryOptions} = registry.workbooks.functions.getAll();

        const {buttonText, handleClick, items, hasMenu} = useCreateEntryOptions({
            scope,
            handleAction,
        });

        if (
            isEnabledFeature(Feature.EnableSharedEntries) &&
            workbook?.collectionId &&
            workbook?.workbookId
        ) {
            items.push(
                getSharedEntriesMenuItems({
                    datasetAction: handleSharedEntryAction(
                        EntryScope.Dataset,
                        workbook.collectionId,
                        workbook.workbookId,
                    ),
                    connectionAction: handleSharedEntryAction(
                        EntryScope.Connection,
                        workbook.collectionId,
                        workbook.workbookId,
                    ),
                    noticeClassName: b('shared-entry-notice'),
                }),
            );
        }

        return (
            <div className={className}>
                {hasMenu ? (
                    <DropdownMenu
                        size="s"
                        items={items}
                        popupProps={{qa: CreateEntityButton.Popup}}
                        renderSwitcher={({onClick}) => (
                            <Button
                                view={view}
                                size={size}
                                qa={CreateEntityButton.Button}
                                onClick={onClick}
                            >
                                {buttonText}
                                <Icon data={ChevronDown} size="16" />
                            </Button>
                        )}
                    />
                ) : (
                    <Button view={view} onClick={handleClick} size={size}>
                        {buttonText}
                    </Button>
                )}
            </div>
        );
    },
);

CreateEntry.displayName = 'CreateEntry';
