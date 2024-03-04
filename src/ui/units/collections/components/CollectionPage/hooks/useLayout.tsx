import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {CancellablePromise} from '@gravity-ui/sdk';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {Feature} from 'shared';
import {DL} from 'ui/constants';
import {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';
import Utils from 'utils';

import type {
    CreateCollectionResponse,
    GetCollectionContentResponse,
} from '../../../../../../shared/schema';
import {CollectionBreadcrumbs} from '../../../../../components/Breadcrumbs/CollectionBreadcrumbs/CollectionBreadcrumbs';
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
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {LayoutContext} from '../../../../collections-navigation/contexts/LayoutContext';
import {getCollection, getCollectionBreadcrumbs} from '../../../store/actions';
import {
    selectBreadcrumbs,
    selectBreadcrumbsIsLoading,
    selectCollection,
    selectCollectionInfoIsLoading,
    selectRootPermissionsData,
    selectRootPermissionsIsLoading,
} from '../../../store/selectors';
import {GetCollectionContentArgs} from '../../../types';
import {CollectionActions} from '../../CollectionActions/CollectionActions';
import {PAGE_SIZE} from '../constants';
const b = block('dl-collection-page');

const i18n = I18n.keyset('collections');

type UseLayoutArgs = {
    curCollectionId: string | null;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    refreshCollectionInfo: () => void;
    filters: CollectionContentFilters;
    updateFilters: (filters: CollectionContentFilters) => void;
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
    getCollectionContentRecursively,
    refreshCollectionInfo,
    filters,
    updateFilters,
    handleCreateWorkbook,
    handeCloseMoveDialog,
    collectionPageViewMode,
    isOpenSelectionMode,
    countSelected,
    onCancelSelectionMode,
    selectBtn,
}: UseLayoutArgs) => {
    const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

    const {
        setActionsPanelLeftBlock,
        setActionsPanelRightBlock,
        setTitle,
        setTitleActionsBlock,
        setTitleRightBlock,
        setDescription,
    } = React.useContext(LayoutContext);

    const dispatch: AppDispatch = useDispatch();

    const breadcrumbsIsLoading = useSelector(selectBreadcrumbsIsLoading);
    const isRootPermissionsLoading = useSelector(selectRootPermissionsIsLoading);
    const rootPermissions = useSelector(selectRootPermissionsData);
    const isCollectionInfoLoading = useSelector(selectCollectionInfoIsLoading);
    const collection = useSelector(selectCollection);
    const breadcrumbs = useSelector(selectBreadcrumbs);

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

    const collectionItems = React.useMemo(
        () =>
            breadcrumbs
                ? breadcrumbs.filter((item) => item.collectionId !== collection?.collectionId)
                : [],
        [breadcrumbs, collection?.collectionId],
    );

    const history = useHistory();

    const {ActionPanelEntrySelect} = registry.common.components.getAll();

    React.useEffect(() => {
        if (breadcrumbsIsLoading === false || curCollectionId === null) {
            setActionsPanelLeftBlock({
                isLoading: false,
                content: (
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
                            onItemClick={(item) => {
                                setTitle({isLoading: false, content: item.title});
                            }}
                        />
                    </div>
                ),
            });
        }
    }, [
        ActionPanelEntrySelect,
        breadcrumbsIsLoading,
        collection,
        collectionItems,
        curCollectionId,
        filters,
        getCollectionContentRecursively,
        setActionsPanelLeftBlock,
        setTitle,
    ]);

    React.useEffect(() => {
        if (
            (isCollectionInfoLoading === false || curCollectionId === null) &&
            isRootPermissionsLoading === false
        ) {
            setActionsPanelRightBlock({
                isLoading: false,
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
                                                history.push(`/collections/${result.collectionId}`);
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
                                                    history.push(`/workbooks/${result.workbookId}`);
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
                                            title: i18n('label_add-learning-materials-workbook'),
                                            collectionId: curCollectionId,
                                            demoWorkbookId: DL.LEARNING_MATERIALS_WORKBOOK_ID,
                                            onSuccessApply: (result) => {
                                                if (result) {
                                                    history.push(`/workbooks/${result.workbookId}`);
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
                                            canUpdate: collection.permissions.updateAccessBindings,
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
            });
        } else {
            setActionsPanelRightBlock({
                isLoading: true,
            });
        }
    }, [
        collection,
        collectionsAccessEnabled,
        curCollectionId,
        dispatch,
        getCollectionContentRecursively,
        handeCloseMoveDialog,
        handleCreateWorkbook,
        history,
        isCollectionInfoLoading,
        isRootPermissionsLoading,
        refreshCollectionInfo,
        rootPermissions,
        setActionsPanelRightBlock,
        updateFilters,
    ]);

    React.useEffect(() => {
        if (curCollectionId === null) {
            setTitle({
                content: i18n('label_root-title'),
            });
            setDescription(null);
        } else {
            setTitle({
                content: collection ? collection.title : null,
            });
            setDescription({
                content: collection ? collection.description : null,
            });
        }
    }, [curCollectionId, collection, setTitle, setDescription]);

    React.useEffect(() => {
        if (curCollectionId === null || isCollectionInfoLoading === false) {
            setTitleActionsBlock({
                isLoading: false,
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
            });
        } else {
            setTitleActionsBlock({
                isLoading: true,
            });
        }
    }, [
        curCollectionId,
        collection,
        setTitle,
        onEditClick,
        setTitleActionsBlock,
        isCollectionInfoLoading,
    ]);

    React.useEffect(() => {
        if (curCollectionId === null || isCollectionInfoLoading === false) {
            setTitleRightBlock({
                isLoading: false,
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
            });
        } else {
            setTitleRightBlock({
                isLoading: collectionPageViewMode === CollectionPageViewMode.Grid,
            });
        }
    }, [
        curCollectionId,
        collectionPageViewMode,
        countSelected,
        isOpenSelectionMode,
        onCancelSelectionMode,
        selectBtn,
        setTitleRightBlock,
        isCollectionInfoLoading,
    ]);

    React.useEffect(() => {
        if (curCollectionId !== null) {
            setActionsPanelLeftBlock({isLoading: true});
            setActionsPanelRightBlock({isLoading: true});
            setTitle({isLoading: true});
            setDescription({isLoading: true});
            setTitleActionsBlock({isLoading: true});
            setTitleRightBlock({isLoading: true});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
