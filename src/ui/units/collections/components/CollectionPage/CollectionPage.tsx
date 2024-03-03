import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import block from 'bem-cn-lite';
import {
    DIALOG_CREATE_WORKBOOK,
    DIALOG_EDIT_COLLECTION,
    DIALOG_MOVE_COLLECTIONS_WORKBOOKS,
} from 'components/CollectionsStructure';
import {IamAccessDialog} from 'components/IamAccessDialog/IamAccessDialog';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {ViewError} from 'components/ViewError/ViewError';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import {Feature} from 'shared';
import type {GetCollectionContentResponse} from 'shared/schema';
import {closeDialog, openDialog} from 'store/actions/dialog';
import {DL} from 'ui/constants';
import {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';
import Utils from 'utils';

import {
    CollectionContentFilters,
    CollectionFilters,
    CollectionPageViewMode,
} from '../../../../components/CollectionFilters';
import {AppDispatch} from '../../../../store';
import {AddDemoWorkbookDialog} from '../../components/AddDemoWorkbookDialog';
import {
    getCollection,
    getCollectionBreadcrumbs,
    getCollectionContent,
    getRootCollectionPermissions,
    resetCollectionContent,
    resetCollectionInfo,
} from '../../store/actions';
import {
    selectBreadcrumbsError,
    selectCollection,
    selectCollectionContentItems,
    selectCollectionInfoIsLoading,
    selectPageError,
    selectRootPermissionsData,
} from '../../store/selectors';
import {GetCollectionContentArgs} from '../../types';
import {CollectionContent} from '../CollectionContent';

import {DEFAULT_FILTERS, DialogState, PAGE_SIZE} from './constants';
import {useCollectionsNavigationLayout, useSelectionMode} from './hooks';
import {getUserDefaultCollectionPageViewMode, getUserDefaultFilters} from './utils';

import './CollectionPage.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-page');

// eslint-disable-next-line complexity
export const CollectionPage = () => {
    const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

    const {collectionId} = useParams<{collectionId?: string}>();
    const curCollectionId = collectionId ?? null;

    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const contentItems = useSelector(selectCollectionContentItems);
    const breadcrumbsError = useSelector(selectBreadcrumbsError);
    const rootPermissions = useSelector(selectRootPermissionsData);
    const isCollectionInfoLoading = useSelector(selectCollectionInfoIsLoading);
    const collection = useSelector(selectCollection);
    const pageError = useSelector(selectPageError);

    const {
        isOpenSelectionMode,
        selectedMap,
        setSelectedMap,
        countSelected,
        itemsWithPermissionMove,
        canMove,
        setIsOpenSelectionMode,
        resetSelected,
        onUpdateCheckbox,
        onSelectAll,
        onCancelSelectionMode,
        selectBtn,
    } = useSelectionMode();

    const [filters, setFilters] = React.useState<CollectionContentFilters>(getUserDefaultFilters());

    const updateFilters = React.useCallback(
        (newFilters: CollectionContentFilters) => {
            setSelectedMap({});
            setFilters(newFilters);
        },
        [setSelectedMap],
    );

    const [collectionPageViewMode, setCollectionPageViewMode] =
        React.useState<CollectionPageViewMode>(getUserDefaultCollectionPageViewMode());
    const onChangeCollectionPageViewMode = React.useCallback(
        (value: CollectionPageViewMode) => {
            setCollectionPageViewMode(value);

            if (value === CollectionPageViewMode.Grid && countSelected === 0) {
                setIsOpenSelectionMode(false);
            }
        },
        [countSelected, setIsOpenSelectionMode],
    );

    const [dialogState, setDialogState] = React.useState(DialogState.None);
    const handleCloseDialog = React.useCallback(() => {
        setDialogState(DialogState.None);
    }, []);

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

    const initLoadCollection = React.useCallback(() => {
        let collectionPromise: CancellablePromise<unknown>;
        let breadcrumbsPromise: CancellablePromise<unknown>;

        if (collectionId) {
            collectionPromise = dispatch(getCollection({collectionId}));

            breadcrumbsPromise = dispatch(getCollectionBreadcrumbs({collectionId}));
        } else {
            dispatch(resetCollectionInfo());
        }

        updateFilters(getUserDefaultFilters());

        return () => {
            if (collectionId) {
                collectionPromise.cancel();
                breadcrumbsPromise.cancel();
            }
        };
    }, [collectionId, dispatch, updateFilters]);

    const refreshContent = React.useCallback(() => {
        dispatch(resetCollectionContent());
        getCollectionContentRecursively({
            collectionId: curCollectionId,
            pageSize: PAGE_SIZE,
            ...filters,
        });

        setIsOpenSelectionMode(false);
        resetSelected();
    }, [
        curCollectionId,
        dispatch,
        filters,
        getCollectionContentRecursively,
        resetSelected,
        setIsOpenSelectionMode,
    ]);

    const refreshPage = React.useCallback(() => {
        initLoadCollection();
        refreshContent();
    }, [initLoadCollection, refreshContent]);

    const handeCloseMoveDialog = React.useCallback(
        (structureChanged: boolean) => {
            if (structureChanged) {
                refreshPage();
            }
            dispatch(closeDialog());
        },
        [dispatch, refreshPage],
    );

    const handleCreateWorkbook = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_CREATE_WORKBOOK,
                props: {
                    open: true,
                    collectionId: curCollectionId,
                    onApply: (result) => {
                        if (result) {
                            history.push(`/workbooks/${result.workbookId}`);
                            return Promise.resolve();
                        } else {
                            updateFilters(getUserDefaultFilters());
                            dispatch(resetCollectionContent());
                            return getCollectionContentRecursively({
                                collectionId: curCollectionId,
                                ...getUserDefaultFilters(),
                            });
                        }
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [curCollectionId, dispatch, getCollectionContentRecursively, history, updateFilters]);

    const onEditClick = React.useCallback(() => {
        if (curCollectionId && collection) {
            dispatch(
                openDialog({
                    id: DIALOG_EDIT_COLLECTION,
                    props: {
                        open: true,
                        collectionId: collection.collectionId,
                        title: collection.title,
                        description: collection?.description ?? '',
                        onApply: () => {
                            return Promise.all([
                                dispatch(
                                    getCollection({
                                        collectionId: curCollectionId,
                                    }),
                                ),
                                dispatch(
                                    getCollectionBreadcrumbs({
                                        collectionId: curCollectionId,
                                    }),
                                ),
                            ]);
                        },
                        onClose: () => {
                            dispatch(closeDialog());
                        },
                    },
                }),
            );
        }
    }, [collection, curCollectionId, dispatch]);

    useCollectionsNavigationLayout({
        curCollectionId,
        getCollectionContentRecursively,
        refreshPage,
        filters,
        updateFilters,
        setDialogState,
        handleCreateWorkbook,
        handeCloseMoveDialog,
        onEditClick,
        collectionPageViewMode,
        isOpenSelectionMode,
        countSelected,
        onCancelSelectionMode,
        selectBtn,
    });

    const setBatchAction = React.useCallback(() => {
        const workbookIds: string[] = [];
        const collectionIds: string[] = [];

        Object.keys(selectedMap).forEach((key) => {
            const item = selectedMap[key];
            if (item.checked) {
                if (item.type === 'workbook') {
                    workbookIds.push(key);
                } else {
                    collectionIds.push(key);
                }
            }
        });

        dispatch(
            openDialog({
                id: DIALOG_MOVE_COLLECTIONS_WORKBOOKS,
                props: {
                    open: true,
                    onApply: refreshContent,
                    onClose: handeCloseMoveDialog,
                    initialParentId: collection?.collectionId,
                    workbookIds,
                    collectionIds,
                },
            }),
        );
    }, [collection?.collectionId, dispatch, handeCloseMoveDialog, refreshContent, selectedMap]);

    // Rights to create collections/workbooks in the root
    React.useEffect(() => {
        let rootPermissionsPromise: CancellablePromise<unknown>;

        if (!rootPermissions) {
            rootPermissionsPromise = dispatch(getRootCollectionPermissions());
        }

        return () => {
            if (rootPermissionsPromise) {
                rootPermissionsPromise.cancel();
            }
        };
    }, [collectionId, rootPermissions, dispatch]);

    // Information for the current collection
    React.useEffect(() => {
        return initLoadCollection();
    }, [initLoadCollection]);

    // The first page of the collection content
    React.useEffect(() => {
        dispatch(resetCollectionContent());

        resetSelected();

        const contentItemsPromise = getCollectionContentRecursively({
            collectionId: curCollectionId,
            pageSize: PAGE_SIZE,
            ...filters,
        });

        return () => {
            contentItemsPromise.cancel();
        };
    }, [curCollectionId, dispatch, filters, getCollectionContentRecursively, resetSelected]);

    const isDefaultFilters =
        filters.filterString === DEFAULT_FILTERS.filterString &&
        filters.onlyMy === DEFAULT_FILTERS.onlyMy &&
        filters.mode === DEFAULT_FILTERS.mode;

    if (
        pageError ||
        (breadcrumbsError && Utils.parseErrorResponse(breadcrumbsError).status !== 403)
    ) {
        return (
            <div className={b()}>
                <ViewError retry={initLoadCollection} error={pageError} />
            </div>
        );
    }

    return (
        <div className={b()}>
            <div className={b('filters')}>
                <CollectionFilters
                    filters={filters}
                    controlSize="l"
                    onChange={updateFilters}
                    collectionPageViewMode={collectionPageViewMode}
                    onChangeCollectionPageViewMode={onChangeCollectionPageViewMode}
                />
            </div>
            {isCollectionInfoLoading && curCollectionId !== null ? (
                <SmartLoader size="l" />
            ) : (
                <CollectionContent
                    collectionId={curCollectionId}
                    getCollectionContentRecursively={getCollectionContentRecursively}
                    collectionPageViewMode={collectionPageViewMode}
                    filters={filters}
                    isDefaultFilters={isDefaultFilters}
                    pageSize={PAGE_SIZE}
                    refreshPage={refreshPage}
                    refreshContent={refreshContent}
                    contentItems={contentItems}
                    countSelected={countSelected}
                    selectedMap={selectedMap}
                    countItemsWithPermissionMove={itemsWithPermissionMove.length}
                    canCreateWorkbook={
                        collectionId && collection
                            ? collection.permissions.createWorkbook
                            : Boolean(rootPermissions?.createWorkbookInRoot)
                    }
                    onCreateWorkbookClick={handleCreateWorkbook}
                    onClearFiltersClick={() => {
                        updateFilters(DEFAULT_FILTERS);
                    }}
                    isOpenSelectionMode={isOpenSelectionMode}
                    canMove={canMove}
                    setBatchAction={setBatchAction}
                    onUpdateCheckbox={onUpdateCheckbox}
                    resetSelected={resetSelected}
                    onSelectAll={onSelectAll}
                />
            )}

            {(DL.TEMPLATE_WORKBOOK_ID || DL.LEARNING_MATERIALS_WORKBOOK_ID) && (
                <AddDemoWorkbookDialog
                    open={
                        dialogState === DialogState.AddLearningMaterialWorkbook ||
                        dialogState === DialogState.AddDemoWorkbook
                    }
                    title={
                        dialogState === DialogState.AddLearningMaterialWorkbook
                            ? i18n('label_add-learning-materials-workbook')
                            : i18n('label_add-demo-workbook')
                    }
                    collectionId={curCollectionId}
                    demoWorkbookId={
                        (dialogState === DialogState.AddLearningMaterialWorkbook
                            ? DL.LEARNING_MATERIALS_WORKBOOK_ID
                            : DL.TEMPLATE_WORKBOOK_ID) as string
                    }
                    onSuccessApply={(result) => {
                        if (result) {
                            history.push(`/workbooks/${result.workbookId}`);
                            return Promise.resolve();
                        } else {
                            updateFilters(getUserDefaultFilters());
                            dispatch(resetCollectionContent());
                            return getCollectionContentRecursively({
                                collectionId: curCollectionId,
                                ...getUserDefaultFilters(),
                            });
                        }
                    }}
                    onClose={handleCloseDialog}
                />
            )}

            {collectionsAccessEnabled && curCollectionId && collection && (
                <IamAccessDialog
                    open={dialogState === DialogState.EditCollectionAccess}
                    resourceId={curCollectionId}
                    resourceType={ResourceType.Collection}
                    resourceTitle={collection.title}
                    parentId={collection.parentId}
                    canUpdate={collection.permissions.updateAccessBindings}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
};
