import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {CancellablePromise} from '@gravity-ui/sdk';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionBreadcrumbs} from 'components/Breadcrumbs/CollectionBreadcrumbs/CollectionBreadcrumbs';
import {
    DIALOG_CREATE_COLLECTION,
    DIALOG_CREATE_WORKBOOK,
    DIALOG_EDIT_COLLECTION,
    DIALOG_MOVE_COLLECTION,
} from 'components/CollectionsStructure';
import {IamAccessDialog} from 'components/IamAccessDialog/IamAccessDialog';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {ViewError} from 'components/ViewError/ViewError';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {Feature} from 'shared';
import type {
    CollectionWithPermissions,
    CreateCollectionResponse,
    GetCollectionBreadcrumbsResponse,
    GetCollectionContentResponse,
    GetCollectionResponse,
    GetRootCollectionPermissionsResponse,
} from 'shared/schema';
import {GetCollectionContentMode} from 'shared/schema/us/types/collections';
import {OrderBasicField, OrderDirection} from 'shared/schema/us/types/sort';
import {AppDispatch} from 'store';
import {closeDialog, openDialog} from 'store/actions/dialog';
import {DL} from 'ui/constants';
import {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';
import {FilterStorage} from 'ui/utils/filterStorage';
import Utils from 'utils';

import {
    CollectionContentFilters,
    CollectionFilters,
    CollectionPageViewMode,
    collectionPageViewModeStore,
} from '../../../../components/CollectionFilters';
import {registry} from '../../../../registry';
import {AddDemoWorkbookDialogContainer} from '../../containers/AddDemoWorkbookDialogContainer/AddDemoWorkbookDialogContainer';
import {CollectionContentContainer} from '../../containers/CollectionContentContainer/CollectionContentContainer';
import {selectBreadcrumbsError} from '../../store/selectors';
import {GetCollectionContentArgs} from '../../types';
import {CollectionActionPanel} from '../CollectionActionPanel/CollectionActionPanel';
import {CollectionActions} from '../CollectionActions/CollectionActions';
import {CollectionLayout} from '../CollectionLayout/CollectionLayout';

import './CollectionPage.scss';

const i18n = I18n.keyset('collections');

const PAGE_SIZE = 50;

const DEFAULT_FILTERS = {
    filterString: undefined,
    orderField: FilterStorage.restore()?.orderField || OrderBasicField.CreatedAt,
    orderDirection: FilterStorage.restore()?.orderDirection || OrderDirection.Desc,
    mode: FilterStorage.restore()?.mode || GetCollectionContentMode.All,
    onlyMy: FilterStorage.restore()?.onlyMy || false,
};

const defaultCollectionPageViewMode =
    Utils.restore(collectionPageViewModeStore) || CollectionPageViewMode.Table;

const b = block('dl-collection-page');

type Props = {
    collectionId?: string;
    isRootPermissionsLoading: boolean;
    rootPermissions: GetRootCollectionPermissionsResponse | null;
    isCollectionInfoLoading: boolean;
    collection: CollectionWithPermissions | null;
    breadcrumbs: GetCollectionBreadcrumbsResponse | null;
    pageError: Error | null;
    getRootCollectionPermissions: () => CancellablePromise<GetRootCollectionPermissionsResponse | null>;
    getCollection: ({
        collectionId,
    }: {
        collectionId: string;
    }) => CancellablePromise<GetCollectionResponse | null>;
    getCollectionBreadcrumbs: ({
        collectionId,
    }: {
        collectionId: string;
    }) => CancellablePromise<GetCollectionBreadcrumbsResponse | null>;
    getCollectionContent: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    resetCollectionInfo: () => void;
    resetCollectionContent: () => void;
};

export enum DialogState {
    None = 'none',
    AddDemoWorkbook = 'addDemoWorkbook',
    AddLearningMaterialWorkbook = 'addLearningMaterialWorkbook',
    EditCollectionAccess = 'editCollectionAccess',
}

export const CollectionPage = React.memo<Props>(
    // eslint-disable-next-line complexity
    ({
        collectionId,
        isRootPermissionsLoading,
        rootPermissions,
        isCollectionInfoLoading,
        collection,
        pageError,
        getRootCollectionPermissions,
        getCollection,
        getCollectionBreadcrumbs,
        getCollectionContent,
        resetCollectionInfo,
        resetCollectionContent,
        breadcrumbs,
    }) => {
        const history = useHistory();

        const dispatch: AppDispatch = useDispatch();

        const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

        const curCollectionId = collectionId ?? null;

        const breadcrumbsError = useSelector(selectBreadcrumbsError);

        const getCollectionContentRecursively = React.useCallback(
            (
                args: GetCollectionContentArgs,
            ): CancellablePromise<GetCollectionContentResponse | null> => {
                let curCollectionsPage = args.collectionsPage;
                let curWorkbooksPage = args.workbooksPage;

                return getCollectionContent(args).then((result) => {
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
            [getCollectionContent],
        );

        const [filters, setFilters] = React.useState<CollectionContentFilters>(DEFAULT_FILTERS);
        const [collectionPageViewMode, setCollectionPageViewMode] =
            React.useState<CollectionPageViewMode>(defaultCollectionPageViewMode);

        const [dialogState, setDialogState] = React.useState(DialogState.None);

        const handleCloseDialog = React.useCallback(() => {
            setDialogState(DialogState.None);
        }, []);

        // Rights to create collections/workbooks in the root
        React.useEffect(() => {
            let rootPermissionsPromise: CancellablePromise<unknown>;

            if (!rootPermissions) {
                rootPermissionsPromise = getRootCollectionPermissions();
            }

            return () => {
                if (rootPermissionsPromise) {
                    rootPermissionsPromise.cancel();
                }
            };
        }, [collectionId, rootPermissions, getRootCollectionPermissions]);

        const initLoadCollection = React.useCallback(() => {
            let collectionPromise: CancellablePromise<unknown>;
            let breadcrumbsPromise: CancellablePromise<unknown>;

            if (collectionId) {
                collectionPromise = getCollection({collectionId});

                breadcrumbsPromise = getCollectionBreadcrumbs({collectionId});
            } else {
                resetCollectionInfo();
            }

            return () => {
                if (collectionId) {
                    collectionPromise.cancel();
                    breadcrumbsPromise.cancel();
                }
            };
        }, [collectionId, getCollection, getCollectionBreadcrumbs, resetCollectionInfo]);

        const refreshContent = React.useCallback(() => {
            initLoadCollection();
            resetCollectionContent();
            getCollectionContentRecursively({
                collectionId: curCollectionId,
                pageSize: PAGE_SIZE,
                ...filters,
            });
        }, [
            curCollectionId,
            filters,
            getCollectionContentRecursively,
            initLoadCollection,
            resetCollectionContent,
        ]);

        const onChangeCollectionPageViewMode = React.useCallback(
            (value: CollectionPageViewMode) => {
                setCollectionPageViewMode(value);
            },
            [],
        );

        // Information for the current collection
        React.useEffect(() => {
            return initLoadCollection();
        }, [initLoadCollection]);

        // The first page of the collection content
        React.useEffect(() => {
            resetCollectionContent();

            const contentItemsPromise = getCollectionContentRecursively({
                collectionId: curCollectionId,
                pageSize: PAGE_SIZE,
                ...filters,
            });

            return () => {
                contentItemsPromise.cancel();
            };
        }, [curCollectionId, filters, getCollectionContentRecursively, resetCollectionContent]);

        const handeCloseMoveDialog = React.useCallback(
            (structureChanged: boolean) => {
                if (structureChanged) {
                    refreshContent();
                }
                dispatch(closeDialog());
            },
            [dispatch, refreshContent],
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
                                setFilters(DEFAULT_FILTERS);
                                resetCollectionContent();
                                return getCollectionContentRecursively({
                                    collectionId: curCollectionId,
                                    ...DEFAULT_FILTERS,
                                });
                            }
                        },
                        onClose: () => {
                            dispatch(closeDialog());
                        },
                    },
                }),
            );
        }, [
            curCollectionId,
            dispatch,
            getCollectionContentRecursively,
            history,
            resetCollectionContent,
        ]);

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

        const {ActionPanelEntrySelect} = registry.common.components.getAll();

        const collectionItems = breadcrumbs
            ? breadcrumbs.filter((item) => item.collectionId !== collection?.collectionId)
            : [];

        const onEditClick = () => {
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
                                    getCollection({
                                        collectionId: curCollectionId,
                                    }),
                                    getCollectionBreadcrumbs({
                                        collectionId: curCollectionId,
                                    }),
                                ]);
                            },
                            onClose: () => {
                                dispatch(closeDialog());
                            },
                        },
                    }),
                );
            }
        };

        return (
            <div className={b()}>
                <CollectionActionPanel
                    leftBlock={
                        <div className={b('action-panel-left-block')}>
                            <ActionPanelEntrySelect />
                            <CollectionBreadcrumbs
                                className={b('breadcrumbs')}
                                collectionBreadcrumbs={collectionItems}
                                collection={collection}
                                onCurrentItemClick={() => {
                                    getCollectionContentRecursively({
                                        collectionId: curCollectionId,
                                        pageSize: PAGE_SIZE,
                                        ...filters,
                                    });
                                }}
                            />
                        </div>
                    }
                    rightBlock={
                        isCollectionInfoLoading || isRootPermissionsLoading ? null : (
                            <CollectionActions
                                collectionData={collection}
                                rootPermissions={rootPermissions}
                                onCreateCollectionClick={() => {
                                    dispatch(
                                        openDialog({
                                            id: DIALOG_CREATE_COLLECTION,
                                            props: {
                                                open: true,
                                                parentId: curCollectionId,
                                                onApply: (
                                                    result: CreateCollectionResponse | null,
                                                ) => {
                                                    if (result) {
                                                        history.push(
                                                            `/collections/${result.collectionId}`,
                                                        );
                                                        return Promise.resolve();
                                                    } else {
                                                        setFilters(DEFAULT_FILTERS);
                                                        resetCollectionContent();
                                                        return getCollectionContentRecursively({
                                                            collectionId: curCollectionId,
                                                            ...DEFAULT_FILTERS,
                                                        });
                                                    }
                                                },
                                                onClose: () => {
                                                    dispatch(closeDialog());
                                                },
                                            },
                                        }),
                                    );
                                }}
                                onAddDemoWorkbookClick={() => {
                                    setDialogState(DialogState.AddDemoWorkbook);
                                }}
                                onAddLearningMaterialsWorkbookClick={() => {
                                    setDialogState(DialogState.AddLearningMaterialWorkbook);
                                }}
                                onCreateWorkbookClick={handleCreateWorkbook}
                                onMoveClick={() => {
                                    if (curCollectionId && collection) {
                                        dispatch(
                                            openDialog({
                                                id: DIALOG_MOVE_COLLECTION,
                                                props: {
                                                    open: true,
                                                    collectionId: collection.collectionId,
                                                    collectionTitle: collection.title,
                                                    initialParentId: collection.parentId,
                                                    onApply: refreshContent,
                                                    onClose: handeCloseMoveDialog,
                                                },
                                            }),
                                        );
                                    }
                                }}
                                onEditAccessClick={() => {
                                    setDialogState(DialogState.EditCollectionAccess);
                                }}
                            />
                        )
                    }
                />
                {isCollectionInfoLoading ? (
                    <SmartLoader size="l" />
                ) : (
                    <React.Fragment>
                        <CollectionLayout
                            title={
                                curCollectionId && collection
                                    ? collection.title
                                    : i18n('label_root-title')
                            }
                            editBtn={
                                Boolean(
                                    curCollectionId && collection && collection.permissions.update,
                                ) && (
                                    <Tooltip content={i18n('action_edit')}>
                                        <div>
                                            <Button onClick={onEditClick}>
                                                <Icon data={PencilToLine} />
                                            </Button>
                                        </div>
                                    </Tooltip>
                                )
                            }
                            description={
                                curCollectionId && collection ? collection.description : null
                            }
                            controls={
                                <CollectionFilters
                                    filters={filters}
                                    controlSize="l"
                                    onChange={setFilters}
                                    collectionPageViewMode={collectionPageViewMode}
                                    onChangeCollectionPageViewMode={onChangeCollectionPageViewMode}
                                />
                            }
                            content={
                                <CollectionContentContainer
                                    collectionId={curCollectionId}
                                    getCollectionContentRecursively={
                                        getCollectionContentRecursively
                                    }
                                    collectionPageViewMode={collectionPageViewMode}
                                    filters={filters}
                                    setFilters={setFilters}
                                    isDefaultFilters={isDefaultFilters}
                                    pageSize={PAGE_SIZE}
                                    refreshContent={refreshContent}
                                    canCreateWorkbook={
                                        collectionId && collection
                                            ? collection.permissions.createWorkbook
                                            : Boolean(rootPermissions?.createWorkbookInRoot)
                                    }
                                    onCreateWorkbookClick={handleCreateWorkbook}
                                    onClearFiltersClick={() => {
                                        setFilters(DEFAULT_FILTERS);
                                    }}
                                />
                            }
                        />
                    </React.Fragment>
                )}
                {(DL.TEMPLATE_WORKBOOK_ID || DL.LEARNING_MATERIALS_WORKBOOK_ID) && (
                    <AddDemoWorkbookDialogContainer
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
                                setFilters(DEFAULT_FILTERS);
                                resetCollectionContent();
                                return getCollectionContentRecursively({
                                    collectionId: curCollectionId,
                                    ...DEFAULT_FILTERS,
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
    },
);

CollectionPage.displayName = 'CollectionPage';
