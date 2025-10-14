import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {Feature} from 'shared';
import {DL} from 'ui/constants/common';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {AnimateBlock} from '../../../../components/AnimateBlock';
import {CollectionFilters} from '../../../../components/CollectionFilters';
import {
    DIALOG_DELETE_COLLECTIONS_WORKBOOKS,
    DIALOG_MOVE_COLLECTIONS_WORKBOOKS,
    DIALOG_NO_CREATE_COLLECTION_PERMISSION,
} from '../../../../components/CollectionsStructure';
import {ViewError} from '../../../../components/ViewError/ViewError';
import type {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import Utils from '../../../../utils';
import {selectCollectionBreadcrumbsError} from '../../../collections-navigation/store/selectors';
import {useRefreshPageAfterImport} from '../../hooks/useRefreshPageAfterImport';
import {
    selectCollection,
    selectCollectionError,
    selectRootCollectionPermissions,
    selectStructureItems,
} from '../../store/selectors';
import {CollectionContent} from '../CollectionContent';
import {DEFAULT_FILTERS} from '../constants';

import {useData, useFilters, useLayout, useSelection, useViewMode} from './hooks';
import {useCreateWorkbookDialogHandlers} from './hooks/useCreateWorkbookDialogHandlers';
import {useOpenCreateWorkbookDialog} from './hooks/useOpenCreateWorkbookDialog';

import './CollectionPage.scss';

const b = block('dl-collection-page');

export const CollectionPage = (props: RouteComponentProps) => {
    const {collectionId} = useParams<{collectionId?: string}>();
    const curCollectionId = collectionId ?? null;

    const dispatch: AppDispatch = useDispatch();

    const collection = useSelector(selectCollection);
    const collectionError = useSelector(selectCollectionError);
    const breadcrumbsError = useSelector(selectCollectionBreadcrumbsError);
    const rootCollectionPermissions = useSelector(selectRootCollectionPermissions);

    const items = useSelector(selectStructureItems);

    const {
        selectedMap,
        selectedMapWithMovePermission,
        selectedMapWithDeletePermission,
        itemsAvailableForSelection,
        isOpenSelectionMode,
        openSelectionMode,
        closeSelectionMode,
        resetSelected,
        updateCheckbox,
        updateAllCheckboxes,
    } = useSelection({curCollectionId});

    const {filters, updateFilters} = useFilters({
        curCollectionId,
        closeSelectionMode,
        resetSelected,
    });

    const {viewMode, changeViewMode} = useViewMode({
        selectedMap,
        openSelectionMode,
        closeSelectionMode,
    });

    const {getStructureItemsRecursively, fetchCollectionInfo, fetchStructureItems, refreshPage} =
        useData({
            curCollectionId,
            filters,
        });

    const {refreshPageAfterImport} = useRefreshPageAfterImport({refreshPage});

    const {handleOpenCreateDialog, handleOpenCreateDialogWithConnection} =
        useCreateWorkbookDialogHandlers();

    const handleCreateDialogAction = React.useCallback(() => {
        handleOpenCreateDialog('default', {refreshPageAfterImport, initialImportStatus: null});
    }, [handleOpenCreateDialog, refreshPageAfterImport]);

    const {search} = props.location;
    useOpenCreateWorkbookDialog({search, refreshPageAfterImport});

    const handeCloseMoveDialog = React.useCallback(
        (structureChanged: boolean) => {
            if (structureChanged) {
                refreshPage();
            }
            dispatch(closeDialog());
        },
        [dispatch, refreshPage],
    );

    const handleShowNoPermissionsDialog = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_NO_CREATE_COLLECTION_PERMISSION,
                props: {
                    visible: true,
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [dispatch]);

    const handleMoveSelectedEntities = React.useCallback(() => {
        const workbookIds: string[] = [];
        const collectionIds: string[] = [];

        Object.keys(selectedMapWithMovePermission).forEach((key) => {
            const type = selectedMap[key];
            if (type === 'workbook') {
                workbookIds.push(key);
            } else {
                collectionIds.push(key);
            }
        });

        dispatch(
            openDialog({
                id: DIALOG_MOVE_COLLECTIONS_WORKBOOKS,
                props: {
                    open: true,
                    onApply: () => {
                        closeSelectionMode();
                        resetSelected();
                        fetchStructureItems();
                    },
                    onClose: handeCloseMoveDialog,
                    initialParentId: collection?.collectionId,
                    workbookIds,
                    collectionIds,
                },
            }),
        );
    }, [
        selectedMapWithMovePermission,
        dispatch,
        handeCloseMoveDialog,
        collection?.collectionId,
        selectedMap,
        closeSelectionMode,
        resetSelected,
        fetchStructureItems,
    ]);

    const handleDeleteSelectedEntities = React.useCallback(() => {
        const workbookIds: string[] = [];
        const workbookTitles: string[] = [];
        const collectionIds: string[] = [];
        const collectionTitles: string[] = [];

        items.forEach((item) => {
            if ('workbookId' in item && selectedMapWithDeletePermission[item.workbookId]) {
                workbookIds.push(item.workbookId);
                workbookTitles.push(item.title);
            } else if (
                'collectionId' in item &&
                item.collectionId &&
                selectedMapWithDeletePermission[item.collectionId]
            ) {
                collectionIds.push(item.collectionId);
                collectionTitles.push(item.title);
            }
        });

        dispatch(
            openDialog({
                id: DIALOG_DELETE_COLLECTIONS_WORKBOOKS,
                props: {
                    open: true,
                    onApply: () => {
                        closeSelectionMode();
                        resetSelected();
                        fetchStructureItems();
                    },
                    onClose: () => dispatch(closeDialog()),
                    collectionIds,
                    collectionTitles,
                    workbookIds,
                    workbookTitles,
                },
            }),
        );
    }, [
        selectedMapWithDeletePermission,
        items,
        dispatch,
        closeSelectionMode,
        resetSelected,
        fetchStructureItems,
    ]);

    const isRootCollection = curCollectionId === null;

    const hasPermissionToCreate =
        curCollectionId && collection
            ? Boolean(collection.permissions?.createWorkbook)
            : Boolean(rootCollectionPermissions?.createWorkbookInRoot);

    const showCreateWorkbookButton = DL.IS_MOBILE
        ? false
        : hasPermissionToCreate || isRootCollection;

    const isFiltersHidden = DL.IS_MOBILE && isEnabledFeature(Feature.HideMultitenant);

    useLayout({
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
        fetchStructureItems,
        handleCreateWorkbook: hasPermissionToCreate
            ? handleCreateDialogAction
            : handleShowNoPermissionsDialog,
        handeCloseMoveDialog,
        updateAllCheckboxes,
    });

    if (
        curCollectionId !== null &&
        (collectionError ||
            (breadcrumbsError && Utils.parseErrorResponse(breadcrumbsError).status !== 403))
    ) {
        return (
            <div className={b()}>
                <AnimateBlock className={b('error-block')}>
                    <ViewError
                        retry={() => {
                            fetchCollectionInfo();
                            fetchStructureItems();
                        }}
                        error={collectionError}
                    />
                </AnimateBlock>
            </div>
        );
    }

    return (
        <div className={b({mobile: DL.IS_MOBILE})}>
            <div className={b('filters', {hidden: isFiltersHidden})}>
                <CollectionFilters
                    filters={filters}
                    controlSize="l"
                    onChange={updateFilters}
                    viewMode={viewMode}
                    changeViewMode={changeViewMode}
                />
            </div>

            <div className={b('content')}>
                <CollectionContent
                    curCollectionId={curCollectionId}
                    filters={filters}
                    viewMode={viewMode}
                    selectedMap={selectedMap}
                    selectedMapWithMovePermission={selectedMapWithMovePermission}
                    selectedMapWithDeletePermission={selectedMapWithDeletePermission}
                    itemsAvailableForSelection={itemsAvailableForSelection}
                    isOpenSelectionMode={isOpenSelectionMode}
                    canCreateWorkbook={hasPermissionToCreate}
                    showCreateWorkbookButton={showCreateWorkbookButton}
                    getStructureItemsRecursively={getStructureItemsRecursively}
                    fetchStructureItems={fetchStructureItems}
                    onCloseMoveDialog={handeCloseMoveDialog}
                    onCreateWorkbookWithConnectionClick={
                        hasPermissionToCreate
                            ? handleOpenCreateDialogWithConnection
                            : handleShowNoPermissionsDialog
                    }
                    onClearFiltersClick={() => {
                        updateFilters({
                            ...DEFAULT_FILTERS,
                            orderField: filters.orderField,
                            orderDirection: filters.orderDirection,
                        });
                    }}
                    onMoveSelectedEntitiesClick={handleMoveSelectedEntities}
                    onDeleteSelectedEntitiesClick={handleDeleteSelectedEntities}
                    resetSelected={resetSelected}
                    onUpdateCheckboxClick={updateCheckbox}
                    onUpdateAllCheckboxesClick={updateAllCheckboxes}
                    isEmptyItems={items.length === 0}
                    refreshPage={refreshPage}
                />
            </div>
        </div>
    );
};
