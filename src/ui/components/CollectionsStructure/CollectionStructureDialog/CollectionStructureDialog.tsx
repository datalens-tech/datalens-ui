import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {WorkbookId} from 'shared';
import {
    GetCollectionContentArgs,
    GetCollectionContentMode,
    GetCollectionContentResponse,
} from 'shared/schema/us/types/collections';
import {OrderBasicField, OrderDirection} from 'shared/schema/us/types/sort';
import {
    CollectionsStructureDispatch,
    createCollection,
    createWorkbook,
    getCollection,
    getCollectionBreadcrumbs,
    getCollectionContent,
    getRootCollectionPermissions,
    resetCollectionBreadcrumbs,
    resetCollectionContent,
    resetState,
} from 'store/actions/collectionsStructure';
import {
    selectBreadcrumbs,
    selectBreadcrumbsIsLoading,
    selectCollectionContentError,
    selectCollectionContentIsLoading,
    selectCollectionContentItems,
    selectCollectionData,
    selectCollectionIsLoading,
    selectCreateCollectionIsLoading,
    selectCreateWorkbookIsLoading,
    selectNextPageTokens,
    selectRootPermissionsData,
} from 'store/selectors/collectionsStructure';

import {CollectionContentFilters, CollectionFilters} from '../../CollectionFilters';

import {CreateEntityDialog} from './CreateEntityDialog/CreateEntityDialog';
import {NewTitleDialog} from './NewTitleDialog/NewTitleDialog';
import {StructureItemSelect} from './StructureItemSelect';

import './CollectionStructureDialog.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collection-structure-dialog');

const PAGE_SIZE = 50;

const DEFAULT_FILTERS = {
    filterString: undefined,
    orderField: OrderBasicField.CreatedAt,
    orderDirection: OrderDirection.Desc,
    mode: GetCollectionContentMode.All,
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
    operationDeniedMessage: string;
    canSelectInitialCollectionId?: boolean;
    caption: string;
    textButtonApply: string;
    applyIsLoading: boolean;
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
};

export const CollectionStructureDialog = React.memo<Props>(
    ({
        open,
        type,
        initialCollectionId,
        defaultTitle = '',
        operationDeniedMessage,
        canSelectInitialCollectionId = true,
        caption,
        textButtonApply,
        applyIsLoading,
        workbookSelectionMode,
        massMoveMode,
        onApply,
        onClose,
    }) => {
        const dispatch = useDispatch<CollectionsStructureDispatch>();

        const rootPermissionsData = useSelector(selectRootPermissionsData);

        const collectionIsLoading = useSelector(selectCollectionIsLoading);
        const collectionData = useSelector(selectCollectionData);

        const breadcrumbsIsLoading = useSelector(selectBreadcrumbsIsLoading);
        const breadcrumbs = useSelector(selectBreadcrumbs) ?? [];

        const collectionContentItems = useSelector(selectCollectionContentItems) ?? [];
        const collectionContentIsLoading = useSelector(selectCollectionContentIsLoading);
        const collectionContentError = useSelector(selectCollectionContentError);
        const nextPageTokens = useSelector(selectNextPageTokens);

        const createCollectionIsLoading = useSelector(selectCreateCollectionIsLoading);
        const createWorkbookIsLoading = useSelector(selectCreateWorkbookIsLoading);

        const [targetCollectionId, setTargetCollectionId] = React.useState(initialCollectionId);
        const [targetWorkbookId, setTargetWorkbookId] = React.useState<string | null>(null);

        const [filters, setFilters] = React.useState<CollectionContentFilters>(DEFAULT_FILTERS);

        const [createCollectionDialogIsOpen, setCreateCollectionDialogIsOpen] =
            React.useState(false);

        const [createWorkbookDialogIsOpen, setCreateWorkbookDialogIsOpen] = React.useState(false);

        const [structureChanged, setStructureChanged] = React.useState(false);

        const [newTitleDialogIsOpen, setNewTitleDialogIsOpen] = React.useState(false);

        const handleClose = React.useCallback(() => {
            onClose(structureChanged);
        }, [structureChanged, onClose]);

        const getCollectionContentRecursively = React.useCallback(
            (
                args: GetCollectionContentArgs,
            ): CancellablePromise<GetCollectionContentResponse | null> => {
                let curCollectionsPage = args.collectionsPage;
                let curWorkbooksPage = args.workbooksPage;

                return dispatch(getCollectionContent(args)).then((result) => {
                    if (
                        (result?.collections.length === 0 &&
                            result.collectionsNextPageToken !== null) ||
                        (result?.workbooks.length === 0 && result.workbooksNextPageToken !== null)
                    ) {
                        curCollectionsPage = result.collectionsNextPageToken;
                        curWorkbooksPage = result.workbooksNextPageToken;

                        return getCollectionContentRecursively({
                            ...args,
                            collectionsPage: curCollectionsPage,
                            workbooksPage: curWorkbooksPage,
                        });
                    } else {
                        return result;
                    }
                });
            },
            [dispatch],
        );

        const fetchData = React.useCallback(() => {
            const promises: CancellablePromise<unknown>[] = [];

            dispatch(resetCollectionContent());
            promises.push(
                getCollectionContentRecursively({
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
        }, [dispatch, filters, getCollectionContentRecursively, targetCollectionId]);

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
        }, [collectionData, rootPermissionsData, targetCollectionId, type]);

        let applyButtonDisabled = collectionIsLoading || !isSelectionAllowed;

        if (!applyButtonDisabled) {
            if (workbookSelectionMode) {
                applyButtonDisabled = targetWorkbookId === null;
            } else if (!canSelectInitialCollectionId) {
                applyButtonDisabled = targetCollectionId === initialCollectionId;
            }
        }

        const handleClickApplyButton = React.useCallback(() => {
            if (!applyButtonDisabled) {
                if (workbookSelectionMode) {
                    onApply({targetCollectionId: null, targetWorkbookId}).then(() => {
                        handleClose();
                    });
                } else if (massMoveMode) {
                    onApply({targetCollectionId, targetWorkbookId: null}).then(() => {
                        handleClose();
                    });
                } else {
                    setNewTitleDialogIsOpen(true);
                }
            }
        }, [
            massMoveMode,
            applyButtonDisabled,
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
                    handleClose();
                });
            },
            [onApply, handleClose, targetCollectionId, targetWorkbookId],
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
                            contentIsLoading={collectionContentIsLoading || breadcrumbsIsLoading}
                            contentError={collectionContentError}
                            breadcrumbs={breadcrumbs}
                            items={collectionContentItems}
                            nextPageTokens={nextPageTokens}
                            pageSize={PAGE_SIZE}
                            isSelectionAllowed={isSelectionAllowed}
                            canSelectWorkbook={workbookSelectionMode}
                            operationDeniedMessage={operationDeniedMessage}
                            getCollectionContentRecursively={getCollectionContentRecursively}
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

                        dispatch(resetCollectionContent());
                        getCollectionContentRecursively({
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
                    onApply={async (title) => {
                        await dispatch(createWorkbook({title, collectionId: targetCollectionId}));

                        setStructureChanged(true);

                        dispatch(resetCollectionContent());
                        getCollectionContentRecursively({
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
