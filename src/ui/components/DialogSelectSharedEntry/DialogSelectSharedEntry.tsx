import React from 'react';

import {Button, Dialog, Icon, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {CollectionId} from 'shared';
import {CollectionItemEntities} from 'shared';
import type {
    GetEntryResponse,
    SharedEntryFieldsWithOptionalPermissions,
    StructureItem,
} from 'shared/schema';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {
    selectBreadcrumbs,
    selectBreadcrumbsIsLoading,
    selectNextPageToken,
    selectStructureItems,
    selectStructureItemsError,
    selectStructureItemsIsLoading,
} from 'ui/store/selectors/collectionsStructure';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {CollectionFilters} from '../CollectionFilters';
import {StructureItemSelect} from '../CollectionsStructure/CollectionStructureDialog/StructureItemSelect';
import {useCollectionStructureDialogState} from '../CollectionsStructure/hooks/useCollectionStructureDialogState';
import {DIALOG_ADD_SHARED_ENTRY_FROM_LINK} from '../DialogAddSharedEntryFromLink/DialogAddSharedEntryFromLink';
import DialogManager from '../DialogManager/DialogManager';

import LinkIcon from '@gravity-ui/icons/svgs/link.svg';

import './DialogSelectSharedEntry.scss';

type DialogSelectSharedEntryProps = {
    open: boolean;
    onClose: () => void;
    collectionId: CollectionId;
    getIsInactiveEntity: (entity: Partial<StructureItem>) => boolean;
    onSelectEntry: (entry: SharedEntryFieldsWithOptionalPermissions) => Promise<void> | void;
    dialogTitle: string;
};

export const DIALOG_SELECT_SHARED_ENTRY = Symbol('DIALOG_SELECT_SHARED_ENTRY');

export interface OpenDialogSelectSharedEntryArgs {
    id: typeof DIALOG_SELECT_SHARED_ENTRY;
    props: DialogSelectSharedEntryProps;
}

const PAGE_SIZE = 50;

const b = block('dialog-select-shared-entries');
const isSharedEntry = (
    entry: Partial<StructureItem | GetEntryResponse>,
): entry is SharedEntryFieldsWithOptionalPermissions => {
    return 'entity' in entry && entry.entity === CollectionItemEntities.ENTRY;
};
export const DialogSelectSharedEntry = ({
    onClose,
    open,
    collectionId,
    getIsInactiveEntity,
    onSelectEntry,
    dialogTitle,
}: DialogSelectSharedEntryProps) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = React.useState(false);
    const {
        filters,
        setFilters,
        handleChangeCollection,
        getStructureItemsRecursively,
        targetCollectionId,
        targetWorkbookId,
    } = useCollectionStructureDialogState({
        open,
        includePermissionsInfo: true,
        initialCollectionId: collectionId,
    });
    const breadcrumbsIsLoading = useSelector(selectBreadcrumbsIsLoading);
    const breadcrumbs = useSelector(selectBreadcrumbs);

    const structureItems = useSelector(selectStructureItems);
    const structureItemsIsLoading = useSelector(selectStructureItemsIsLoading);
    const structureItemsError = useSelector(selectStructureItemsError);
    const nextPageToken = useSelector(selectNextPageToken);

    const onSelectEntryHandle = React.useCallback(
        async (entry: Partial<StructureItem>) => {
            if (isSharedEntry(entry)) {
                setIsLoading(true);
                await onSelectEntry(entry);
                setIsLoading(false);
            }
        },
        [onSelectEntry],
    );

    const onAddFromLinkClick = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_ADD_SHARED_ENTRY_FROM_LINK,
                props: {
                    open: true,
                    isValidEntry: (entry) => {
                        if (isSharedEntry(entry)) {
                            return !getIsInactiveEntity(entry);
                        }
                        return false;
                    },
                    onSuccess: async (entry) => {
                        if (isSharedEntry(entry)) {
                            dispatch(closeDialog());
                            setIsLoading(true);
                            await onSelectEntry(entry);
                            setIsLoading(false);
                        }
                    },
                    onClose: () => dispatch(closeDialog()),
                },
            }),
        );
    }, [dispatch, onSelectEntry, getIsInactiveEntity]);

    return (
        <Dialog open={open} onClose={onClose} className={b()}>
            <Dialog.Header caption={dialogTitle} />
            <Dialog.Body className={b('body')}>
                <div>
                    <CollectionFilters
                        className={b('filters')}
                        filters={filters}
                        onChange={setFilters}
                        compactMode
                        canFilterOnlyEntries
                        searchRowExtendContent={
                            <div className={b('extend-filters')}>
                                <Text variant="body-1">
                                    {getSharedEntryMockText('or-select-shared-entry-dialog')}
                                </Text>
                                <Button onClick={onAddFromLinkClick}>
                                    <Icon data={LinkIcon} size={16} />
                                    {getSharedEntryMockText(
                                        'past-link-btn-select-shared-entry-dialog',
                                    )}
                                </Button>
                            </div>
                        }
                    />
                </div>
                <StructureItemSelect
                    collectionId={targetCollectionId}
                    workbookId={targetWorkbookId}
                    contentIsLoading={structureItemsIsLoading || breadcrumbsIsLoading || isLoading}
                    contentError={structureItemsError}
                    breadcrumbs={breadcrumbs}
                    items={isLoading ? [] : structureItems}
                    nextPageToken={nextPageToken}
                    pageSize={PAGE_SIZE}
                    isSelectionAllowed={true}
                    canSelectWorkbook={false}
                    getStructureItemsRecursively={getStructureItemsRecursively}
                    onChangeCollection={handleChangeCollection}
                    onSelectEntry={onSelectEntryHandle}
                    getIsInactiveItem={getIsInactiveEntity}
                />
            </Dialog.Body>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SELECT_SHARED_ENTRY, DialogSelectSharedEntry);
