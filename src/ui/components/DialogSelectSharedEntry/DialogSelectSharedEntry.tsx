import React from 'react';

import {Button, Dialog, Icon, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import type {StructureItem} from 'shared/schema';
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
import DialogManager from '../DialogManager/DialogManager';

import LinkIcon from '@gravity-ui/icons/svgs/link.svg';

import './DialogSelectSharedEntry.scss';

type DialogSelectSharedEntryProps = {
    open: boolean;
    onClose: () => void;
    collectionId: string;
    getIsInactiveEntity?: (entity: StructureItem) => boolean;
    onSelectEntry: (entry: StructureItem) => void;
    dialogTitle: string;
};

export const DIALOG_SELECT_SHARED_ENTRY = Symbol('DIALOG_SELECT_SHARED_ENTRY');

export interface OpenDialogSelectSharedEntryArgs {
    id: typeof DIALOG_SELECT_SHARED_ENTRY;
    props: DialogSelectSharedEntryProps;
}

const PAGE_SIZE = 50;

const b = block('dialog-select-shared-entries');

export const DialogSelectSharedEntry = ({
    onClose,
    open,
    collectionId,
    getIsInactiveEntity,
    onSelectEntry,
    dialogTitle,
}: DialogSelectSharedEntryProps) => {
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
        async (entry: StructureItem) => {
            setIsLoading(true);
            await onSelectEntry(entry);
            setIsLoading(false);
        },
        [onSelectEntry],
    );

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
                        // TODO create add link modal
                        searchRowExtendContent={
                            <div className={b('extend-filters')}>
                                <Text variant="body-1">
                                    {getSharedEntryMockText('or-select-shared-entry-dialog')}
                                </Text>
                                <Button disabled>
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
