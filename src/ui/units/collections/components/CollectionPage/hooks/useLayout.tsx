import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {batch, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {Feature} from '../../../../../../shared';
import type {
    CollectionWithPermissions,
    CreateCollectionResponse,
    WorkbookWithPermissions,
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
import {DL} from '../../../../../constants';
import {registry} from '../../../../../registry';
import {ResourceType} from '../../../../../registry/units/common/types/components/IamAccessDialog';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import Utils from '../../../../../utils';
import {
    CollectionBreadcrumbs,
    cutBreadcrumbs,
} from '../../../../collections-navigation/components/CollectionBreadcrumbs';
import {COLLECTIONS_PATH, WORKBOOKS_PATH} from '../../../../collections-navigation/constants';
import {LayoutContext} from '../../../../collections-navigation/contexts/LayoutContext';
import {setCollectionBreadcrumbs} from '../../../../collections-navigation/store/actions';
import {
    selectCollectionBreadcrumbs,
    selectCollectionBreadcrumbsError,
} from '../../../../collections-navigation/store/selectors';
import {setCollection} from '../../../store/actions';
import {
    selectCollection,
    selectCollectionError,
    selectRootCollectionPermissions,
} from '../../../store/selectors';
import {CollectionActions} from '../../CollectionActions';

import {SelectedMap} from './useSelection';

const b = block('dl-collection-page');

const i18n = I18n.keyset('collections');

type UseLayoutArgs = {
    curCollectionId: string | null;
    filters: CollectionContentFilters;
    selectedMap: SelectedMap;
    itemsAvailableForSelection: (CollectionWithPermissions | WorkbookWithPermissions)[];
    viewMode: CollectionPageViewMode;
    isOpenSelectionMode: boolean;
    openSelectionMode: () => void;
    closeSelectionMode: () => void;
    resetSelected: () => void;
    fetchCollectionInfo: () => void;
    fetchCollectionContent: () => void;
    handleCreateWorkbook: () => void;
    handeCloseMoveDialog: (structureChanged: boolean) => void;
    updateAllCheckboxes: (checked: boolean) => void;
};

export const useLayout = ({
    curCollectionId,
    filters,
    selectedMap,
    itemsAvailableForSelection,
    viewMode,
    isOpenSelectionMode,
    openSelectionMode,
    closeSelectionMode,
    resetSelected,
    fetchCollectionInfo,
    fetchCollectionContent,
    handleCreateWorkbook,
    handeCloseMoveDialog,
    updateAllCheckboxes,
}: UseLayoutArgs) => {
    const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

    const {ActionPanelEntrySelect} = registry.common.components.getAll();
    const {RootCollectionTitleAction} = registry.collections.components.getAll();

    const {setLayout} = React.useContext(LayoutContext);

    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const collection = useSelector(selectCollection);
    const collectionError = useSelector(selectCollectionError);
    const breadcrumbs = useSelector(selectCollectionBreadcrumbs);
    const breadcrumbsError = useSelector(selectCollectionBreadcrumbsError);
    const rootCollectionPermissions = useSelector(selectRootCollectionPermissions);

    const isRootCollection = curCollectionId === null;
    const isCorrectCollection = Boolean(collection && collection.collectionId === curCollectionId);
    const isCorrectBreadcrumbs = Boolean(
        isRootCollection ||
            (breadcrumbs && breadcrumbs[breadcrumbs.length - 1]?.collectionId === curCollectionId),
    );

    React.useEffect(() => {
        let preparedBreadcrumbs = breadcrumbs ?? [];
        if (breadcrumbsError && collection) {
            preparedBreadcrumbs = [collection];
        }

        setLayout({
            actionsPanelLeftBlock: {
                content: (
                    <div className={b('action-panel-left-block')}>
                        <ActionPanelEntrySelect />
                        <CollectionBreadcrumbs
                            className={b('breadcrumbs')}
                            isLoading={!(isCorrectBreadcrumbs || breadcrumbsError)}
                            collections={preparedBreadcrumbs}
                            workbook={null}
                            onItemClick={({isCurrent, id}) => {
                                if (isCurrent) {
                                    fetchCollectionContent();
                                } else if (id !== null) {
                                    batch(() => {
                                        const newBreadcrumbs = cutBreadcrumbs(
                                            id,
                                            preparedBreadcrumbs,
                                        );
                                        dispatch(setCollectionBreadcrumbs(newBreadcrumbs));

                                        const curBreadcrumb =
                                            newBreadcrumbs[newBreadcrumbs.length - 1];
                                        if (curBreadcrumb) {
                                            dispatch(setCollection(curBreadcrumb));
                                        }
                                    });
                                }
                            }}
                        />
                    </div>
                ),
            },
        });
    }, [
        ActionPanelEntrySelect,
        breadcrumbs,
        breadcrumbsError,
        collection,
        curCollectionId,
        dispatch,
        fetchCollectionContent,
        filters,
        isCorrectBreadcrumbs,
        isRootCollection,
        setLayout,
    ]);

    React.useEffect(() => {
        if (
            (isRootCollection && rootCollectionPermissions) ||
            (isCorrectCollection && collection && collection.permissions)
        ) {
            setLayout({
                actionsPanelRightBlock: {
                    content: (
                        <CollectionActions
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
                                                        `${COLLECTIONS_PATH}/${result.collectionId}`,
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
                                                            `${WORKBOOKS_PATH}/${result.workbookId}`,
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
                                                            `${WORKBOOKS_PATH}/${result.workbookId}`,
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
                                                onApply: fetchCollectionInfo,
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
                                                canUpdate: Boolean(
                                                    collection.permissions?.updateAccessBindings,
                                                ),
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
        isCorrectCollection,
        setLayout,
        curCollectionId,
        rootCollectionPermissions,
        fetchCollectionInfo,
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
                titleActionsBlock: {
                    content: <RootCollectionTitleAction />,
                },
            });
        } else if (isCorrectCollection && collection && collection.permissions) {
            setLayout({
                titleActionsBlock: {
                    content:
                        curCollectionId && collection && collection.permissions?.update ? (
                            <Tooltip content={i18n('action_edit')}>
                                <div>
                                    <Button
                                        onClick={() => {
                                            if (
                                                curCollectionId &&
                                                isCorrectCollection &&
                                                collection
                                            ) {
                                                dispatch(
                                                    openDialog({
                                                        id: DIALOG_EDIT_COLLECTION,
                                                        props: {
                                                            open: true,
                                                            collectionId: collection.collectionId,
                                                            title: collection.title,
                                                            description:
                                                                collection?.description ?? '',
                                                            onApply: fetchCollectionInfo,
                                                            onClose: () => {
                                                                dispatch(closeDialog());
                                                            },
                                                        },
                                                    }),
                                                );
                                            }
                                        }}
                                    >
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
        setLayout,
        isCorrectCollection,
        isRootCollection,
        dispatch,
        fetchCollectionInfo,
        RootCollectionTitleAction,
    ]);

    React.useEffect(() => {
        setLayout({
            titleRightBlock: {
                content:
                    viewMode === CollectionPageViewMode.Grid ? (
                        <React.Fragment>
                            {isOpenSelectionMode ? (
                                <React.Fragment>
                                    {Object.keys(selectedMap).length > 0 ? (
                                        <Button
                                            view="outlined"
                                            onClick={() => updateAllCheckboxes(false)}
                                        >
                                            {i18n('action_reset-all')}
                                        </Button>
                                    ) : (
                                        <Button
                                            view="outlined"
                                            onClick={() => updateAllCheckboxes(true)}
                                        >
                                            {i18n('action_select-all')}
                                        </Button>
                                    )}
                                    <Button
                                        className={b('cancel-selection-button')}
                                        view="outlined-danger"
                                        onClick={() => {
                                            closeSelectionMode();
                                            resetSelected();
                                        }}
                                    >
                                        {i18n('action_cancel')}
                                    </Button>
                                </React.Fragment>
                            ) : (
                                <Button
                                    disabled={itemsAvailableForSelection.length === 0}
                                    view="outlined"
                                    onClick={openSelectionMode}
                                >
                                    {i18n('action_select')}
                                </Button>
                            )}
                        </React.Fragment>
                    ) : null,
            },
        });
    }, [
        isOpenSelectionMode,
        setLayout,
        viewMode,
        selectedMap,
        itemsAvailableForSelection.length,
        openSelectionMode,
        closeSelectionMode,
        updateAllCheckboxes,
        resetSelected,
    ]);

    React.useEffect(() => {
        if (collectionError) {
            setLayout({
                actionsPanelLeftBlock: null,
                actionsPanelRightBlock: null,
                title: null,
                titleActionsBlock: null,
                titleRightBlock: null,
                description: null,
            });
        }
    }, [collectionError, setLayout]);
};
