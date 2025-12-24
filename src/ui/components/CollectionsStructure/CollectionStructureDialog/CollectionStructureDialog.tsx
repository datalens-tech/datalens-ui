import React from 'react';

import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {WorkbookId} from 'shared';
import {DialogCollectionStructureQa} from 'shared/constants/qa/collections';
import type {WorkbookWithPermissions} from 'shared/schema';
import type {CollectionsStructureDispatch} from 'store/actions/collectionsStructure';
import {
    createCollection,
    createWorkbook,
    resetStructureItems,
} from 'store/actions/collectionsStructure';
import {
    selectBreadcrumbs,
    selectBreadcrumbsIsLoading,
    selectCollectionData,
    selectCollectionIsLoading,
    selectCreateCollectionIsLoading,
    selectCreateWorkbookIsLoading,
    selectFilteredStructureItems,
    selectNextPageToken,
    selectRootPermissionsData,
    selectStructureItemsError,
    selectStructureItemsIsLoading,
} from 'store/selectors/collectionsStructure';

import {CollectionFilters} from '../../CollectionFilters';
import {useCollectionStructureDialogState} from '../hooks/useCollectionStructureDialogState';

import {CreateEntityDialog} from './CreateEntityDialog/CreateEntityDialog';
import {NewTitleDialog} from './NewTitleDialog/NewTitleDialog';
import {StructureItemSelect} from './StructureItemSelect';

import './CollectionStructureDialog.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collection-structure-dialog');

const PAGE_SIZE = 50;

export enum ResourceType {
    Collection = 'collection',
    Workbook = 'workbook',
}

export type Props = {
    open: boolean;
    type: ResourceType;
    initialCollectionId: string | null;
    defaultTitle?: string;
    defaultNewWorkbookTitle?: string;
    operationDeniedMessage?: string;
    canSelectInitialCollectionId?: boolean;
    caption: string;
    textButtonApply: string;
    applyIsLoading?: boolean;
    closeDialogAfterSuccessfulApply?: boolean;
    workbookSelectionMode: boolean;
    massMoveMode?: boolean;
    onApply: ({
        targetCollectionId,
        targetWorkbookId,
        targetTitle,
    }: {
        targetCollectionId: string | null;
        targetWorkbookId: WorkbookId;
        targetTitle?: string;
    }) => Promise<unknown>;
    onClose: (structureChanged: boolean) => void;
    additionalButtons?: React.ReactNode;
    useCustomDialog?: boolean;
};

export const CollectionStructureDialog = React.memo<Props>(
    ({
        open,
        type,
        initialCollectionId,
        defaultTitle = '',
        defaultNewWorkbookTitle = '',
        operationDeniedMessage,
        canSelectInitialCollectionId = true,
        caption,
        textButtonApply,
        applyIsLoading = false,
        closeDialogAfterSuccessfulApply = true,
        workbookSelectionMode,
        massMoveMode,
        onApply,
        onClose,
        additionalButtons,
        useCustomDialog,
    }) => {
        const {
            targetCollectionId,
            filters,
            setFilters,
            getStructureItemsRecursively,
            handleChangeCollection,
            targetWorkbookId,
            handleChangeWorkbook,
        } = useCollectionStructureDialogState({
            open,
            initialCollectionId,
            includePermissionsInfo: workbookSelectionMode,
        });

        const dispatch = useDispatch<CollectionsStructureDispatch>();

        const rootPermissionsData = useSelector(selectRootPermissionsData);

        const collectionIsLoading = useSelector(selectCollectionIsLoading);
        const collectionData = useSelector(selectCollectionData);

        const breadcrumbsIsLoading = useSelector(selectBreadcrumbsIsLoading);
        const breadcrumbs = useSelector(selectBreadcrumbs);

        const structureItems = useSelector(selectFilteredStructureItems);
        const structureItemsIsLoading = useSelector(selectStructureItemsIsLoading);
        const structureItemsError = useSelector(selectStructureItemsError);
        const nextPageToken = useSelector(selectNextPageToken);

        const createCollectionIsLoading = useSelector(selectCreateCollectionIsLoading);
        const createWorkbookIsLoading = useSelector(selectCreateWorkbookIsLoading);

        const [createCollectionDialogIsOpen, setCreateCollectionDialogIsOpen] =
            React.useState(false);

        const [createWorkbookDialogIsOpen, setCreateWorkbookDialogIsOpen] = React.useState(false);

        const [structureChanged, setStructureChanged] = React.useState(false);

        const [newTitleDialogIsOpen, setNewTitleDialogIsOpen] = React.useState(false);

        const handleClose = React.useCallback(() => {
            onClose(structureChanged);
        }, [structureChanged, onClose]);

        const canCreateCollection = React.useMemo(() => {
            if (targetCollectionId) {
                return collectionData?.permissions.createCollection || false;
            }

            return rootPermissionsData?.createCollectionInRoot || false;
        }, [targetCollectionId, rootPermissionsData, collectionData]);

        const canCreateWorkbook = React.useMemo(() => {
            if (targetCollectionId) {
                return collectionData?.permissions.createWorkbook || false;
            }

            return rootPermissionsData?.createWorkbookInRoot || false;
        }, [targetCollectionId, rootPermissionsData, collectionData]);

        const isSelectionAllowed = React.useMemo(() => {
            if (workbookSelectionMode) {
                return true;
            }

            let result = true;

            if (targetCollectionId && collectionData) {
                result =
                    (type === ResourceType.Collection
                        ? collectionData?.permissions.createCollection
                        : collectionData?.permissions.createWorkbook) ?? false;
            } else if (rootPermissionsData) {
                result =
                    (type === ResourceType.Collection
                        ? rootPermissionsData?.createCollectionInRoot
                        : rootPermissionsData?.createWorkbookInRoot) ?? false;
            }

            return result;
        }, [collectionData, rootPermissionsData, targetCollectionId, type, workbookSelectionMode]);

        let applyButtonDisabled = collectionIsLoading || !isSelectionAllowed;

        if (!applyButtonDisabled) {
            if (workbookSelectionMode) {
                if (targetWorkbookId) {
                    const targetWorkbook = structureItems.find(
                        (item) => 'workbookId' in item && item.workbookId === targetWorkbookId,
                    ) as WorkbookWithPermissions;

                    if (targetWorkbook) {
                        applyButtonDisabled = targetWorkbook?.permissions.update !== true;
                    } else {
                        applyButtonDisabled = true;
                    }
                } else {
                    applyButtonDisabled = true;
                }
            } else if (!canSelectInitialCollectionId) {
                applyButtonDisabled = targetCollectionId === initialCollectionId;
            }
        }

        const handleClickApplyButton = React.useCallback(() => {
            if (!applyButtonDisabled) {
                if (workbookSelectionMode) {
                    onApply({targetCollectionId: null, targetWorkbookId}).then(() => {
                        if (closeDialogAfterSuccessfulApply) {
                            handleClose();
                        }
                    });
                } else if (massMoveMode) {
                    onApply({targetCollectionId, targetWorkbookId: null}).then(() => {
                        if (closeDialogAfterSuccessfulApply) {
                            handleClose();
                        }
                    });
                } else if (useCustomDialog) {
                    onApply({targetCollectionId, targetWorkbookId});
                } else {
                    setNewTitleDialogIsOpen(true);
                }
            }
        }, [
            applyButtonDisabled,
            workbookSelectionMode,
            massMoveMode,
            useCustomDialog,
            onApply,
            targetWorkbookId,
            closeDialogAfterSuccessfulApply,
            handleClose,
            targetCollectionId,
        ]);

        const handleApply = React.useCallback(
            (targetTitle: string) => {
                onApply({targetCollectionId, targetWorkbookId, targetTitle}).then(() => {
                    if (closeDialogAfterSuccessfulApply) {
                        handleClose();
                    }
                });
            },
            [
                onApply,
                handleClose,
                targetCollectionId,
                targetWorkbookId,
                closeDialogAfterSuccessfulApply,
            ],
        );

        return (
            <React.Fragment>
                <Dialog
                    className={b()}
                    size="m"
                    open={open}
                    onClose={handleClose}
                    onEnterKeyDown={handleClickApplyButton}
                    disableHeightTransition={true}
                >
                    <Dialog.Header caption={caption} />
                    <Dialog.Body>
                        <CollectionFilters
                            className={b('filters')}
                            filters={filters}
                            onChange={setFilters}
                            compactMode
                        />
                        <StructureItemSelect
                            collectionId={targetCollectionId}
                            workbookId={targetWorkbookId}
                            contentIsLoading={structureItemsIsLoading || breadcrumbsIsLoading}
                            contentError={structureItemsError}
                            breadcrumbs={breadcrumbs}
                            items={structureItems}
                            nextPageToken={nextPageToken}
                            pageSize={PAGE_SIZE}
                            isSelectionAllowed={isSelectionAllowed}
                            canSelectWorkbook={workbookSelectionMode}
                            operationDeniedMessage={operationDeniedMessage}
                            getStructureItemsRecursively={getStructureItemsRecursively}
                            onChangeCollection={handleChangeCollection}
                            onChangeWorkbook={handleChangeWorkbook}
                            disabled={applyIsLoading}
                        />
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonCancel={handleClose}
                        onClickButtonApply={handleClickApplyButton}
                        textButtonApply={textButtonApply}
                        propsButtonApply={{
                            disabled: applyButtonDisabled,
                            qa: DialogCollectionStructureQa.ApplyButton,
                        }}
                        textButtonCancel={i18n('action_cancel')}
                        loading={applyIsLoading}
                    >
                        <div className={b('footer-buttons')}>
                            {canCreateCollection && !workbookSelectionMode && (
                                <Button
                                    size="l"
                                    view="outlined"
                                    onClick={() => {
                                        setCreateCollectionDialogIsOpen(true);
                                    }}
                                >
                                    {i18n('action_create-collection')}
                                </Button>
                            )}
                            {canCreateWorkbook && workbookSelectionMode && (
                                <Button
                                    size="l"
                                    view="outlined"
                                    onClick={() => {
                                        setCreateWorkbookDialogIsOpen(true);
                                    }}
                                >
                                    {i18n('action_create-workbook')}
                                </Button>
                            )}

                            {additionalButtons}
                        </div>
                    </Dialog.Footer>
                </Dialog>
                <NewTitleDialog
                    open={newTitleDialogIsOpen}
                    isLoading={applyIsLoading}
                    defaultTitle={defaultTitle}
                    textButtonApply={textButtonApply}
                    onApply={(targetTitle) => {
                        handleApply(targetTitle);
                    }}
                    onClose={() => {
                        setNewTitleDialogIsOpen(false);
                    }}
                />

                <CreateEntityDialog
                    open={createCollectionDialogIsOpen}
                    title={i18n('action_create-collection')}
                    isLoading={createCollectionIsLoading}
                    onApply={async (title) => {
                        await dispatch(createCollection({title, parentId: targetCollectionId}));

                        setStructureChanged(true);

                        dispatch(resetStructureItems());
                        getStructureItemsRecursively({
                            collectionId: targetCollectionId,
                            pageSize: PAGE_SIZE,
                            ...filters,
                        });
                    }}
                    onClose={() => {
                        setCreateCollectionDialogIsOpen(false);
                    }}
                />

                <CreateEntityDialog
                    open={createWorkbookDialogIsOpen}
                    title={i18n('action_create-workbook')}
                    isLoading={createWorkbookIsLoading}
                    defaultTitleValue={defaultNewWorkbookTitle}
                    onApply={async (title) => {
                        await dispatch(createWorkbook({title, collectionId: targetCollectionId}));

                        setStructureChanged(true);

                        dispatch(resetStructureItems());
                        getStructureItemsRecursively({
                            collectionId: targetCollectionId,
                            pageSize: PAGE_SIZE,
                            ...filters,
                        });
                    }}
                    onClose={() => {
                        setCreateWorkbookDialogIsOpen(false);
                    }}
                />
            </React.Fragment>
        );
    },
);

CollectionStructureDialog.displayName = 'CollectionStructureDialog';
