import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {Feature} from 'shared';
import {DL} from 'ui/constants';
import Utils from 'utils';

import type {
    CreateCollectionResponse,
    GetCollectionBreadcrumbsResponse,
} from '../../../../../../shared/schema';
import {
    CollectionContentFilters,
    CollectionPageViewMode,
} from '../../../../../components/CollectionFilters';
import {
    DIALOG_ADD_DEMO_WORKBOOK,
    DIALOG_CREATE_COLLECTION,
    DIALOG_EDIT_COLLECTION,
    DIALOG_MOVE_COLLECTION,
} from '../../../../../components/CollectionsStructure';
import {DIALOG_IAM_ACCESS} from '../../../../../components/IamAccessDialog';
import {registry} from '../../../../../registry';
import {ResourceType} from '../../../../../registry/units/common/types/components/IamAccessDialog';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {CollectionBreadcrumbs} from '../../../../collections-navigation/components/CollectionBreadcrumbs/CollectionBreadcrumbs';
import {LayoutContext} from '../../../../collections-navigation/contexts/LayoutContext';
import {
    getCollectionBreadcrumbs,
    setCollectionBreadcrumbs,
} from '../../../../collections-navigation/store/actions';
import {
    selectCollectionBreadcrumbs,
    selectCollectionBreadcrumbsError,
} from '../../../../collections-navigation/store/selectors';
import {getCollection, setCollection} from '../../../store/actions';
import {
    selectCollection,
    selectPageError,
    selectRootPermissionsData,
    selectRootPermissionsIsLoading,
} from '../../../store/selectors';
import {CollectionActions} from '../../CollectionActions/CollectionActions';

const b = block('dl-collection-page');

const i18n = I18n.keyset('collections');

type UseLayoutArgs = {
    curCollectionId: string | null;
    fetchCollectionContent: () => void;
    refreshCollectionInfo: () => void;
    filters: CollectionContentFilters;
    handleCreateWorkbook: () => void;
    handeCloseMoveDialog: (structureChanged: boolean) => void;
    collectionPageViewMode: CollectionPageViewMode;
    isOpenSelectionMode: boolean;
    countSelected: number;
    onCancelSelectionMode: () => void;
    selectBtn: React.ReactNode;
};

export const useLayout = ({
    curCollectionId,
    fetchCollectionContent,
    refreshCollectionInfo,
    filters,
    handleCreateWorkbook,
    handeCloseMoveDialog,
    collectionPageViewMode,
    isOpenSelectionMode,
    countSelected,
    onCancelSelectionMode,
    selectBtn,
}: UseLayoutArgs) => {
    const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

    const {ActionPanelEntrySelect} = registry.common.components.getAll();

    const {setLayout} = React.useContext(LayoutContext);

    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const isRootPermissionsLoading = useSelector(selectRootPermissionsIsLoading);
    const rootPermissions = useSelector(selectRootPermissionsData);
    const collection = useSelector(selectCollection);
    const isCollectionLoading = !collection || curCollectionId !== collection.collectionId;
    const collectionBreadcrumbs = useSelector(selectCollectionBreadcrumbs);
    const collectionBreadcrumbsError = useSelector(selectCollectionBreadcrumbsError);
    const pageError = useSelector(selectPageError);

    const isRootCollection = curCollectionId === null;

    const isCorrectCollection = Boolean(collection && collection.collectionId === curCollectionId);

    const isCorrectCollectionBreadcrumbs = Boolean(
        collectionBreadcrumbs &&
            collectionBreadcrumbs[collectionBreadcrumbs.length - 1]?.collectionId ===
                curCollectionId,
    );

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

    React.useEffect(() => {
        setLayout({
            actionsPanelLeftBlock: {
                content: (
                    <div className={b('action-panel-left-block')}>
                        <ActionPanelEntrySelect />
                        <CollectionBreadcrumbs
                            className={b('breadcrumbs')}
                            isLoading={
                                !(
                                    isRootCollection ||
                                    isCorrectCollectionBreadcrumbs ||
                                    collectionBreadcrumbsError
                                )
                            }
                            collections={collectionBreadcrumbs ?? []}
                            workbook={null}
                            onItemClick={({isCurrent, id}) => {
                                if (isCurrent) {
                                    fetchCollectionContent();
                                } else if (id === null) {
                                    dispatch(setCollectionBreadcrumbs([]));
                                } else {
                                    let isFound = false;

                                    const newBreadcrumbs = (
                                        collectionBreadcrumbs ?? []
                                    ).reduce<GetCollectionBreadcrumbsResponse>((acc, item) => {
                                        if (!isFound) {
                                            acc.push(item);
                                        }
                                        if (id === item.collectionId) {
                                            isFound = true;
                                        }
                                        return acc;
                                    }, []);

                                    dispatch(setCollectionBreadcrumbs(newBreadcrumbs));

                                    const curBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
                                    if (newBreadcrumbs[newBreadcrumbs.length - 1]) {
                                        dispatch(setCollection(curBreadcrumb));
                                    }
                                }
                            }}
                        />
                    </div>
                ),
            },
        });
    }, [
        ActionPanelEntrySelect,
        collection,
        collectionBreadcrumbs,
        collectionBreadcrumbsError,
        curCollectionId,
        dispatch,
        fetchCollectionContent,
        filters,
        isCorrectCollectionBreadcrumbs,
        isRootCollection,
        setLayout,
    ]);

    React.useEffect(() => {
        if (
            (isRootCollection && !isRootPermissionsLoading) ||
            (isCorrectCollection && collection && collection.permissions)
        ) {
            setLayout({
                actionsPanelRightBlock: {
                    content: (
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
                                            onApply: (result: CreateCollectionResponse | null) => {
                                                if (result) {
                                                    history.push(
                                                        `/collections/${result.collectionId}`,
                                                    );
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
                                if (DL.TEMPLATE_WORKBOOK_ID) {
                                    dispatch(
                                        openDialog({
                                            id: DIALOG_ADD_DEMO_WORKBOOK,
                                            props: {
                                                open: true,
                                                title: i18n('label_add-demo-workbook'),
                                                collectionId: curCollectionId,
                                                demoWorkbookId: DL.TEMPLATE_WORKBOOK_ID,
                                                onSuccessApply: (result) => {
                                                    if (result) {
                                                        history.push(
                                                            `/workbooks/${result.workbookId}`,
                                                        );
                                                    }
                                                },
                                                onClose: () => {
                                                    dispatch(closeDialog());
                                                },
                                            },
                                        }),
                                    );
                                }
                            }}
                            onAddLearningMaterialsWorkbookClick={() => {
                                if (DL.LEARNING_MATERIALS_WORKBOOK_ID) {
                                    dispatch(
                                        openDialog({
                                            id: DIALOG_ADD_DEMO_WORKBOOK,
                                            props: {
                                                open: true,
                                                title: i18n(
                                                    'label_add-learning-materials-workbook',
                                                ),
                                                collectionId: curCollectionId,
                                                demoWorkbookId: DL.LEARNING_MATERIALS_WORKBOOK_ID,
                                                onSuccessApply: (result) => {
                                                    if (result) {
                                                        history.push(
                                                            `/workbooks/${result.workbookId}`,
                                                        );
                                                    }
                                                },
                                                onClose: () => {
                                                    dispatch(closeDialog());
                                                },
                                            },
                                        }),
                                    );
                                }
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
                                                onApply: refreshCollectionInfo,
                                                onClose: handeCloseMoveDialog,
                                            },
                                        }),
                                    );
                                }
                            }}
                            onEditAccessClick={() => {
                                if (collectionsAccessEnabled && curCollectionId && collection) {
                                    dispatch(
                                        openDialog({
                                            id: DIALOG_IAM_ACCESS,
                                            props: {
                                                open: true,
                                                resourceId: collection.collectionId,
                                                resourceType: ResourceType.Collection,
                                                resourceTitle: collection.title,
                                                parentId: collection.parentId,
                                                canUpdate:
                                                    collection.permissions.updateAccessBindings,
                                                onClose: () => {
                                                    dispatch(closeDialog());
                                                },
                                            },
                                        }),
                                    );
                                }
                            }}
                        />
                    ),
                },
            });
        } else {
            setLayout({
                actionsPanelRightBlock: {
                    isLoading: true,
                },
            });
        }
    }, [
        collection,
        collectionsAccessEnabled,
        isRootCollection,
        dispatch,
        handeCloseMoveDialog,
        handleCreateWorkbook,
        history,
        isCollectionLoading,
        isCorrectCollection,
        isRootPermissionsLoading,
        refreshCollectionInfo,
        rootPermissions,
        setLayout,
        curCollectionId,
    ]);

    React.useEffect(() => {
        if (isRootCollection) {
            setLayout({
                title: {
                    content: i18n('label_root-title'),
                },
                description: null,
            });
        } else if (isCorrectCollection && collection) {
            setLayout({
                title: {
                    content: collection.title,
                },
                description: collection.description
                    ? {
                          content: collection.description,
                      }
                    : null,
            });
        } else {
            setLayout({
                title: {
                    isLoading: true,
                },
            });
        }
    }, [curCollectionId, collection, setLayout, isRootCollection, isCorrectCollection]);

    React.useEffect(() => {
        if (isRootCollection) {
            setLayout({
                titleActionsBlock: null,
            });
        } else if (isCorrectCollection && collection && collection.permissions) {
            setLayout({
                titleActionsBlock: {
                    content:
                        curCollectionId && collection && collection.permissions.update ? (
                            <Tooltip content={i18n('action_edit')}>
                                <div>
                                    <Button onClick={onEditClick}>
                                        <Icon data={PencilToLine} />
                                    </Button>
                                </div>
                            </Tooltip>
                        ) : null,
                },
            });
        } else {
            setLayout({
                titleActionsBlock: {
                    isLoading: true,
                },
            });
        }
    }, [
        curCollectionId,
        collection,
        onEditClick,
        setLayout,
        isCorrectCollection,
        isRootCollection,
    ]);

    React.useEffect(() => {
        setLayout({
            titleRightBlock: {
                content:
                    collectionPageViewMode === CollectionPageViewMode.Grid ? (
                        <React.Fragment>
                            {selectBtn}
                            {(isOpenSelectionMode || Boolean(countSelected)) && (
                                <Button
                                    className={b('cancel-btn')}
                                    view="outlined-danger"
                                    onClick={onCancelSelectionMode}
                                >
                                    {i18n('action_cancel')}
                                </Button>
                            )}
                        </React.Fragment>
                    ) : null,
            },
        });
    }, [
        collectionPageViewMode,
        countSelected,
        isOpenSelectionMode,
        onCancelSelectionMode,
        selectBtn,
        setLayout,
    ]);

    React.useEffect(() => {
        if (pageError) {
            setLayout({
                actionsPanelLeftBlock: null,
                actionsPanelRightBlock: null,
                title: null,
                titleActionsBlock: null,
                titleRightBlock: null,
                description: null,
            });
        }
    }, [pageError, setLayout]);
};
