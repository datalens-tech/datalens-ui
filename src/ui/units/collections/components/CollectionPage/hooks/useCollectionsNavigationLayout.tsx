import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {CancellablePromise} from '@gravity-ui/sdk';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

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
    DIALOG_CREATE_COLLECTION,
    DIALOG_MOVE_COLLECTION,
} from '../../../../../components/CollectionsStructure';
import {registry} from '../../../../../registry';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {CollectionsNavigationLayoutContext} from '../../../../collections-navigation/components/CollectionsNavigationLayout';
import {resetCollectionContent} from '../../../store/actions';
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
import {DialogState, PAGE_SIZE} from '../constants';
import {getUserDefaultFilters} from '../utils';

const b = block('dl-collection-page');

const i18n = I18n.keyset('collections');

type UseCollectionsNavigationLayoutArgs = {
    curCollectionId: string | null;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    refreshPage: () => void;
    filters: CollectionContentFilters;
    updateFilters: (filters: CollectionContentFilters) => void;
    setDialogState: (state: DialogState) => void;
    handleCreateWorkbook: () => void;
    handeCloseMoveDialog: (structureChanged: boolean) => void;
    onEditClick: () => void;
    collectionPageViewMode: CollectionPageViewMode;
    isOpenSelectionMode: boolean;
    countSelected: number;
    onCancelSelectionMode: () => void;
    selectBtn: React.ReactNode;
};

export const useCollectionsNavigationLayout = ({
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
}: UseCollectionsNavigationLayoutArgs) => {
    const {
        setActionsPanelLeftBlock,
        setActionsPanelRightBlock,
        setTitle,
        setTitleActionsBlock,
        setTitleRightBlock,
        setDescription,
    } = React.useContext(CollectionsNavigationLayoutContext);

    const dispatch: AppDispatch = useDispatch();

    const breadcrumbsIsLoading = useSelector(selectBreadcrumbsIsLoading);
    const isRootPermissionsLoading = useSelector(selectRootPermissionsIsLoading);
    const rootPermissions = useSelector(selectRootPermissionsData);
    const isCollectionInfoLoading = useSelector(selectCollectionInfoIsLoading);
    const collection = useSelector(selectCollection);
    const breadcrumbs = useSelector(selectBreadcrumbs);

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
                                            onApply: refreshPage,
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
                ),
            });
        }
    }, [
        collection,
        curCollectionId,
        dispatch,
        getCollectionContentRecursively,
        handeCloseMoveDialog,
        handleCreateWorkbook,
        history,
        isCollectionInfoLoading,
        isRootPermissionsLoading,
        refreshPage,
        rootPermissions,
        setActionsPanelRightBlock,
        setDialogState,
        updateFilters,
    ]);

    React.useEffect(() => {
        setTitle({
            isLoading: false,
            content: curCollectionId && collection ? collection.title : i18n('label_root-title'),
        });
        setDescription({
            isLoading: false,
            content: curCollectionId && collection ? collection.description : null,
        });
    }, [curCollectionId, collection, setTitle, setDescription]);

    React.useEffect(() => {
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
    }, [curCollectionId, collection, setTitle, onEditClick, setTitleActionsBlock]);

    React.useEffect(() => {
        setTitleRightBlock({
            isLoading: false,
            content: collectionPageViewMode === CollectionPageViewMode.Grid && (
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
            ),
        });
    }, [
        collectionPageViewMode,
        countSelected,
        isOpenSelectionMode,
        onCancelSelectionMode,
        selectBtn,
        setTitleRightBlock,
    ]);

    React.useEffect(() => {
        if (curCollectionId !== null) {
            setActionsPanelLeftBlock({isLoading: true});
            setActionsPanelRightBlock({isLoading: true});
            setTitle({isLoading: true});
            setDescription({isLoading: true});
            // setTitleActionsBlock({isLoading: true});
            // setTitleRightBlock({isLoading: true});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
