import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import {Feature} from 'shared';
import {isMobileView} from 'ui/utils/mobile';

import {AnimateBlock} from '../../../../components/AnimateBlock';
import {CollectionFilters} from '../../../../components/CollectionFilters';
import {
    DIALOG_CREATE_WORKBOOK,
    DIALOG_MOVE_COLLECTIONS_WORKBOOKS,
} from '../../../../components/CollectionsStructure';
import {ViewError} from '../../../../components/ViewError/ViewError';
import type {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import Utils from '../../../../utils';
import {WORKBOOKS_PATH} from '../../../collections-navigation/constants';
import {selectCollectionBreadcrumbsError} from '../../../collections-navigation/store/selectors';
import {
    selectCollection,
    selectCollectionError,
    selectRootCollectionPermissions,
} from '../../store/selectors';
import {CollectionContent} from '../CollectionContent';
import {DEFAULT_FILTERS} from '../constants';

import {useData, useFilters, useLayout, useSelection, useViewMode} from './hooks';

import './CollectionPage.scss';

const b = block('dl-collection-page');

export const CollectionPage = () => {
    const {collectionId} = useParams<{collectionId?: string}>();
    const curCollectionId = collectionId ?? null;

    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const collection = useSelector(selectCollection);
    const collectionError = useSelector(selectCollectionError);
    const breadcrumbsError = useSelector(selectCollectionBreadcrumbsError);
    const rootCollectionPermissions = useSelector(selectRootCollectionPermissions);

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

    const {
        getCollectionContentRecursively,
        fetchCollectionInfo,
        fetchCollectionContent,
        refreshPage,
    } = useData({
        curCollectionId,
        filters,
    });

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
                            history.push(`${WORKBOOKS_PATH}/${result.workbookId}`);
                        }
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [curCollectionId, dispatch, history]);

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
                        fetchCollectionContent();
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
        fetchCollectionContent,
    ]);

    const handleDeleteSelectedEntities = React.useCallback(() => {
        const workbookIds: string[] = [];
        const collectionIds: string[] = [];

        Object.keys(selectedMapWithDeletePermission).forEach((key) => {
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
                        fetchCollectionContent();
                    },
                    onClose: handeCloseMoveDialog,
                    initialParentId: collection?.collectionId,
                    workbookIds,
                    collectionIds,
                },
            }),
        );
    }, [
        selectedMapWithDeletePermission,
        dispatch,
        handeCloseMoveDialog,
        collection?.collectionId,
        selectedMap,
        closeSelectionMode,
        resetSelected,
        fetchCollectionContent,
    ]);

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
        fetchCollectionContent,
        handleCreateWorkbook,
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
                            fetchCollectionContent();
                        }}
                        error={collectionError}
                    />
                </AnimateBlock>
            </div>
        );
    }

    const hasPermissionToCreate =
        curCollectionId && collection
            ? Boolean(collection.permissions?.createWorkbook)
            : Boolean(rootCollectionPermissions?.createWorkbookInRoot);

    const canCreateWorkbook = isMobileView ? false : hasPermissionToCreate;

    const isFiltersHidden = isMobileView && Utils.isEnabledFeature(Feature.HideMultitenant);

    return (
        <div className={b({mobile: isMobileView})}>
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
                    itemsAvailableForSelection={itemsAvailableForSelection}
                    isOpenSelectionMode={isOpenSelectionMode}
                    canCreateWorkbook={canCreateWorkbook}
                    getCollectionContentRecursively={getCollectionContentRecursively}
                    fetchCollectionContent={fetchCollectionContent}
                    onCloseMoveDialog={handeCloseMoveDialog}
                    onCreateWorkbookClick={handleCreateWorkbook}
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
                />
            </div>
        </div>
    );
};
