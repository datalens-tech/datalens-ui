import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';

import {AnimateBlock} from '../../../../components/AnimateBlock';
import {CollectionFilters} from '../../../../components/CollectionFilters';
import {
    DIALOG_CREATE_WORKBOOK,
    DIALOG_MOVE_COLLECTIONS_WORKBOOKS,
} from '../../../../components/CollectionsStructure';
import {ViewError} from '../../../../components/ViewError/ViewError';
import {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import Utils from '../../../../utils';
import {selectCollectionBreadcrumbsError} from '../../../collections-navigation/store/selectors';
import {
    selectCollection,
    selectCollectionContentItems,
    selectCollectionError,
    selectRootCollectionPermissionsData,
} from '../../store/selectors';
import {CollectionContent} from '../CollectionContent';

import {DEFAULT_FILTERS, PAGE_SIZE} from './constants';
import {useData, useFilters, useLayout, useSelectionMode, useViewMode} from './hooks';

import './CollectionPage.scss';

const b = block('dl-collection-page');

export const CollectionPage = () => {
    const {collectionId} = useParams<{collectionId?: string}>();
    const curCollectionId = collectionId ?? null;

    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const contentItems = useSelector(selectCollectionContentItems);
    const breadcrumbsError = useSelector(selectCollectionBreadcrumbsError);
    const rootPermissions = useSelector(selectRootCollectionPermissionsData);
    const collection = useSelector(selectCollection);
    const pageError = useSelector(selectCollectionError);

    const {
        isOpenSelectionMode,
        selectedMap,
        setSelectedMap,
        countSelected,
        itemsWithPermissionMove,
        canMove,
        setIsOpenSelectionMode,
        openSelectionMode,
        resetSelected,
        updateCheckbox,
        closeSelectionMode,
        updateAllCheckboxes,
    } = useSelectionMode({curCollectionId});

    const {filters, updateFilters} = useFilters({curCollectionId, setSelectedMap});

    const {collectionPageViewMode, onChangeCollectionPageViewMode} = useViewMode({
        countSelected,
        setIsOpenSelectionMode,
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
                            history.push(`/workbooks/${result.workbookId}`);
                        }
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [curCollectionId, dispatch, history]);

    const moveSelectedEntities = React.useCallback(() => {
        const workbookIds: string[] = [];
        const collectionIds: string[] = [];

        Object.keys(selectedMap).forEach((key) => {
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
        collection?.collectionId,
        dispatch,
        handeCloseMoveDialog,
        closeSelectionMode,
        resetSelected,
        fetchCollectionContent,
        selectedMap,
    ]);

    useLayout({
        curCollectionId,
        fetchCollectionContent,
        refreshCollectionInfo: refreshPage,
        filters,
        handleCreateWorkbook,
        handeCloseMoveDialog,
        collectionPageViewMode,
        isOpenSelectionMode,
        openSelectionMode,
        countSelected,
        onCancelSelectionMode: closeSelectionMode,
        canMove,
        updateAllCheckboxes,
    });

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
                <AnimateBlock className={b('error-block')}>
                    <ViewError
                        retry={() => {
                            fetchCollectionInfo();
                            fetchCollectionContent();
                        }}
                        error={pageError}
                    />
                </AnimateBlock>
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
            <div className={b('content')}>
                <CollectionContent
                    collectionId={curCollectionId}
                    getCollectionContentRecursively={getCollectionContentRecursively}
                    collectionPageViewMode={collectionPageViewMode}
                    filters={filters}
                    isDefaultFilters={isDefaultFilters}
                    pageSize={PAGE_SIZE}
                    refreshPage={refreshPage}
                    refreshContent={fetchCollectionContent}
                    contentItems={contentItems}
                    countSelected={countSelected}
                    selectedMap={selectedMap}
                    countItemsWithPermissionMove={itemsWithPermissionMove.length}
                    canCreateWorkbook={
                        collectionId && collection
                            ? Boolean(collection.permissions?.createWorkbook)
                            : Boolean(rootPermissions?.createWorkbookInRoot)
                    }
                    onCreateWorkbookClick={handleCreateWorkbook}
                    onClearFiltersClick={() => {
                        updateFilters({
                            ...DEFAULT_FILTERS,
                            orderField: filters.orderField,
                            orderDirection: filters.orderDirection,
                        });
                    }}
                    isOpenSelectionMode={isOpenSelectionMode}
                    canMove={canMove}
                    setBatchAction={moveSelectedEntities}
                    onUpdateCheckbox={updateCheckbox}
                    resetSelected={resetSelected}
                    onSelectAll={updateAllCheckboxes}
                />
            </div>
        </div>
    );
};
