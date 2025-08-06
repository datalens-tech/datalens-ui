import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {WorkbookId} from 'shared';
import type {
    GetStructureItemsArgs,
    GetStructureItemsMode,
    GetStructureItemsResponse,
    OrderBasicField,
    OrderDirection,
    WorkbookWithPermissions,
} from 'shared/schema';
import type {CollectionsStructureDispatch} from 'store/actions/collectionsStructure';
import {
    createCollection,
    createWorkbook,
    getCollection,
    getCollectionBreadcrumbs,
    getRootCollectionPermissions,
    getStructureItems,
    resetCollectionBreadcrumbs,
    resetState,
    resetStructureItems,
} from 'store/actions/collectionsStructure';
import {
    selectBreadcrumbs,
    selectBreadcrumbsIsLoading,
    selectCollectionData,
    selectCollectionIsLoading,
    selectCreateCollectionIsLoading,
    selectCreateWorkbookIsLoading,
    selectNextPageToken,
    selectRootPermissionsData,
    selectStructureItems,
    selectStructureItemsError,
    selectStructureItemsIsLoading,
} from 'store/selectors/collectionsStructure';

import type {StructureItemsFilters} from '../../CollectionFilters';
import {CollectionFilters} from '../../CollectionFilters';

import {CreateEntityDialog} from './CreateEntityDialog/CreateEntityDialog';
import {NewTitleDialog} from './NewTitleDialog/NewTitleDialog';
import {StructureItemSelect} from './StructureItemSelect';

import './CollectionStructureDialog.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collection-structure-dialog');

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: {
    filterString?: string;
    orderField: OrderBasicField;
    orderDirection: OrderDirection;
    mode: GetStructureItemsMode;
    onlyMy: boolean;
} = {
    filterString: undefined,
    orderField: 'createdAt',
    orderDirection: 'desc',
    mode: 'all',
    onlyMy: false,
};

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
    }) => {
        const dispatch = useDispatch<CollectionsStructureDispatch>();

        const rootPermissionsData = useSelector(selectRootPermissionsData);

        const collectionIsLoading = useSelector(selectCollectionIsLoading);
        const collectionData = useSelector(selectCollectionData);

        const breadcrumbsIsLoading = useSelector(selectBreadcrumbsIsLoading);
        const breadcrumbs = useSelector(selectBreadcrumbs) ?? [];

        const structureItems = useSelector(selectStructureItems) ?? [];
        const structureItemsIsLoading = useSelector(selectStructureItemsIsLoading);
        const structureItemsError = useSelector(selectStructureItemsError);
        const nextPageToken = useSelector(selectNextPageToken);

        const createCollectionIsLoading = useSelector(selectCreateCollectionIsLoading);
        const createWorkbookIsLoading = useSelector(selectCreateWorkbookIsLoading);

        const [targetCollectionId, setTargetCollectionId] = React.useState(initialCollectionId);
        const [targetWorkbookId, setTargetWorkbookId] = React.useState<string | null>(null);

        const [filters, setFilters] = React.useState<StructureItemsFilters>(DEFAULT_FILTERS);

        const [createCollectionDialogIsOpen, setCreateCollectionDialogIsOpen] =
            React.useState(false);

        const [createWorkbookDialogIsOpen, setCreateWorkbookDialogIsOpen] = React.useState(false);

        const [structureChanged, setStructureChanged] = React.useState(false);

        const [newTitleDialogIsOpen, setNewTitleDialogIsOpen] = React.useState(false);

        const handleClose = React.useCallback(() => {
            onClose(structureChanged);
        }, [structureChanged, onClose]);

        const includePermissionsInfo = workbookSelectionMode;

        const getStructureItemsRecursively = React.useCallback(
            (args: GetStructureItemsArgs): CancellablePromise<GetStructureItemsResponse | null> => {
                let curPage = args.page;

                return dispatch(getStructureItems({...args, includePermissionsInfo})).then(
                    (result) => {
                        if (result?.items.length === 0 && result.nextPageToken !== null) {
                            curPage = result.nextPageToken;

                            return getStructureItemsRecursively({
                                ...args,
                                includePermissionsInfo,
                                page: curPage,
                            });
                        } else {
                            return result;
                        }
                    },
                );
            },
            [dispatch, includePermissionsInfo],
        );

        const fetchData = React.useCallback(() => {
            const promises: CancellablePromise<unknown>[] = [];

            dispatch(resetStructureItems());
            promises.push(
                getStructureItemsRecursively({
                    collectionId: targetCollectionId,
                    pageSize: PAGE_SIZE,
                    ...filters,
                }),
            );

            if (targetCollectionId) {
                promises.push(dispatch(getCollection({collectionId: targetCollectionId})));
                promises.push(
                    dispatch(getCollectionBreadcrumbs({collectionId: targetCollectionId})),
                );
            } else {
                dispatch(resetCollectionBreadcrumbs());
            }

            return promises;
        }, [dispatch, filters, getStructureItemsRecursively, targetCollectionId]);

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
                } else {
                    setNewTitleDialogIsOpen(true);
                }
            }
        }, [
            massMoveMode,
            applyButtonDisabled,
            closeDialogAfterSuccessfulApply,
            workbookSelectionMode,
            onApply,
            targetCollectionId,
            targetWorkbookId,
            handleClose,
        ]);

        const handleChangeCollection = React.useCallback((newValue: string | null) => {
            setTargetCollectionId(newValue);
            setTargetWorkbookId(null);
            setFilters((prevFilters) => ({...prevFilters, filterString: undefined}));
        }, []);

        const handleChangeWorkbook = React.useCallback((newValue: string | null) => {
            setTargetWorkbookId(newValue);
        }, []);

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

        React.useEffect(() => {
            setTargetCollectionId(initialCollectionId);
        }, [initialCollectionId]);

        React.useEffect(() => {
            const promises: CancellablePromise<unknown>[] = [];

            if (open) {
                dispatch(resetState());
                promises.push(dispatch(getRootCollectionPermissions()));
            }

            return () => {
                promises.forEach((promise) => {
                    promise.cancel();
                });
            };
        }, [dispatch, open]);

        React.useEffect(() => {
            const promises: CancellablePromise<unknown>[] = [];

            if (open) {
                promises.push(...fetchData());
            }

            return () => {
                promises.forEach((promise) => {
                    promise.cancel();
                });
            };
        }, [fetchData, open]);

        return (
            <React.Fragment>
                <Dialog
                    className={b()}
                    size="m"
                    open={open}
                    onClose={handleClose}
                    onEnterKeyDown={handleClickApplyButton}
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
