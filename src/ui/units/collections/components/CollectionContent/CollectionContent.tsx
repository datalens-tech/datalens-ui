import React from 'react';

import {ArrowRight, Copy, LockOpen, PencilToLine, TrashBin} from '@gravity-ui/icons';
import {CancellablePromise} from '@gravity-ui/sdk';
import {Button, DropdownMenuItem} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {
    DIALOG_COPY_WORKBOOK,
    DIALOG_DELETE_COLLECTION,
    DIALOG_DELETE_WORKBOOK,
    DIALOG_EDIT_COLLECTION,
    DIALOG_EDIT_WORKBOOK,
    DIALOG_MOVE_COLLECTION,
    DIALOG_MOVE_WORKBOOK,
} from 'components/CollectionsStructure';
import {DIALOG_IAM_ACCESS} from 'components/IamAccessDialog';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {Waypoint} from 'react-waypoint';
import type {
    CollectionWithPermissions,
    GetCollectionContentResponse,
    UpdateCollectionResponse,
    UpdateWorkbookResponse,
    WorkbookWithPermissions,
} from 'shared/schema';
import {BatchPanel} from 'ui/components/Navigation/components/BatchPanel/BatchPanel';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import {Feature} from '../../../../../shared';
import {CollectionPageViewMode} from '../../../../components/CollectionFilters/CollectionFilters';
import {DropdownAction} from '../../../../components/DropdownAction/DropdownAction';
import {ResourceType} from '../../../../registry/units/common/types/components/IamAccessDialog';
import {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import Utils from '../../../../utils';
import {deleteCollectionInItems, deleteWorkbookInItems} from '../../store/actions';
import {
    selectContentError,
    selectContentIsLoading,
    selectNextPageTokens,
} from '../../store/selectors';
import {GetCollectionContentArgs} from '../../types';
import {CollectionContentGrid} from '../CollectionContentGrid/CollectionContentGrid';
import {CollectionContentTable} from '../CollectionContentTable/CollectionContentTable';
import {ContentProps} from '../types';

import './CollectionContent.scss';

const b = block('dl-collection-content');
const i18n = I18n.keyset('collections');

interface Props extends ContentProps {
    collectionId: string | null;
    pageSize: number;
    collectionPageViewMode: CollectionPageViewMode;
    isDefaultFilters: boolean;
    isOpenSelectionMode: boolean;
    canCreateWorkbook: boolean;
    refreshPage: () => void;
    refreshContent: () => void;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    onCreateWorkbookClick: () => void;
    onClearFiltersClick: () => void;
    setBatchAction: () => void;
    resetSelected: () => void;
}

export const CollectionContent: React.FC<Props> = ({
    collectionId,
    pageSize,
    filters,
    collectionPageViewMode,
    isDefaultFilters,
    canCreateWorkbook,
    isOpenSelectionMode,
    canMove,
    contentItems,
    countItemsWithPermissionMove,
    selectedMap,
    countSelected,
    getCollectionContentRecursively,
    onCreateWorkbookClick,
    onClearFiltersClick,
    refreshContent,
    setBatchAction,
    resetSelected,
    onSelectAll,
    onUpdateCheckbox,
}) => {
    const [waypointDisabled, setWaypointDisabled] = React.useState(false);
    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const isContentLoading = useSelector(selectContentIsLoading);
    const contentLoadingError = useSelector(selectContentError);
    const nextPageTokens = useSelector(selectNextPageTokens);

    const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

    const handeCloseMoveDialog = React.useCallback(
        (structureChanged: boolean) => {
            if (structureChanged) {
                refreshContent();
            }
            dispatch(closeDialog());
        },
        [dispatch, refreshContent],
    );

    React.useEffect(() => {
        if (contentLoadingError) {
            setWaypointDisabled(true);
        }
    }, [contentLoadingError]);

    const onWaypointEnter = React.useCallback(() => {
        if (nextPageTokens.collectionsNextPageToken || nextPageTokens.workbooksNextPageToken) {
            getCollectionContentRecursively({
                collectionId,
                collectionsPage: nextPageTokens.collectionsNextPageToken,
                workbooksPage: nextPageTokens.workbooksNextPageToken,
                pageSize,
                ...filters,
            }).then((res) => {
                if (
                    (res?.collectionsNextPageToken &&
                        res?.collectionsNextPageToken ===
                            nextPageTokens.collectionsNextPageToken) ||
                    (res?.workbooksNextPageToken &&
                        res?.workbooksNextPageToken === nextPageTokens.workbooksNextPageToken)
                ) {
                    setWaypointDisabled(true);
                }
                return res;
            });
        }
    }, [
        collectionId,
        filters,
        getCollectionContentRecursively,
        nextPageTokens.collectionsNextPageToken,
        nextPageTokens.workbooksNextPageToken,
        pageSize,
    ]);

    const renderCreateWorkbookAction = () => {
        if (canCreateWorkbook) {
            return (
                <Button className={b('controls')} onClick={onCreateWorkbookClick}>
                    {i18n('action_create-workbook')}
                </Button>
            );
        }
        return null;
    };

    const renderClearFiltersAction = () => {
        return (
            <Button className={b('controls')} onClick={onClearFiltersClick}>
                {i18n('action_clear-filters')}
            </Button>
        );
    };

    if (isContentLoading && contentItems.length === 0) {
        return <SmartLoader size="l" />;
    }

    if (contentItems.length === 0) {
        if (isDefaultFilters) {
            return (
                <div className={b('empty-state')}>
                    <PlaceholderIllustration
                        name="template"
                        title={i18n('label_empty-list')}
                        description={canCreateWorkbook ? i18n('section_create-first') : undefined}
                        renderAction={renderCreateWorkbookAction}
                    />
                </div>
            );
        }
        return (
            <div className={b('empty-state')}>
                <PlaceholderIllustration
                    name="notFound"
                    title={i18n('label_not-found')}
                    description={i18n('section_incorrect-filters')}
                    renderAction={renderClearFiltersAction}
                />
            </div>
        );
    }

    const getCollectionActions = (
        item: CollectionWithPermissions,
    ): (DropdownMenuItem[] | DropdownMenuItem)[] => {
        const actions: (DropdownMenuItem[] | DropdownMenuItem)[] = [];

        if (item.permissions.update) {
            actions.push({
                text: <DropdownAction icon={PencilToLine} text={i18n('action_edit')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_EDIT_COLLECTION,
                            props: {
                                open: true,
                                collectionId: item.collectionId,
                                title: item.title,
                                description: item?.description ?? '',
                                onApply: (collection: UpdateCollectionResponse | null) => {
                                    if (collection) {
                                        refreshContent();
                                    }
                                },
                                onClose: () => {
                                    dispatch(closeDialog());
                                },
                            },
                        }),
                    );
                },
            });
        }

        if (item.permissions.move) {
            actions.push({
                text: <DropdownAction icon={ArrowRight} text={i18n('action_move')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_MOVE_COLLECTION,
                            props: {
                                open: true,
                                collectionId: item.collectionId,
                                collectionTitle: item.title,
                                initialParentId: item.parentId,
                                onApply: refreshContent,
                                onClose: handeCloseMoveDialog,
                            },
                        }),
                    );
                },
            });
        }

        if (collectionsAccessEnabled && item.permissions.listAccessBindings) {
            actions.push({
                text: <DropdownAction icon={LockOpen} text={i18n('action_access')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_IAM_ACCESS,
                            props: {
                                open: true,
                                resourceId: item.collectionId,
                                resourceType: ResourceType.Collection,
                                resourceTitle: item.title,
                                parentId: item.parentId,
                                canUpdate: item.permissions.updateAccessBindings,
                                onClose: () => {
                                    dispatch(closeDialog());
                                },
                            },
                        }),
                    );
                },
            });
        }

        const otherActions: DropdownMenuItem[] = [];
        if (item.permissions.delete) {
            otherActions.push({
                text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_DELETE_COLLECTION,
                            props: {
                                open: true,
                                collectionId: item.collectionId,
                                collectionTitle: item.title,
                                onSuccessApply: (id) => {
                                    dispatch(deleteCollectionInItems(id));
                                },
                                onClose: () => {
                                    dispatch(closeDialog());
                                },
                            },
                        }),
                    );
                },
                theme: 'danger',
            });
        }

        actions.push([...otherActions]);
        return actions;
    };

    const getWorkbookActions = (
        item: WorkbookWithPermissions,
    ): (DropdownMenuItem[] | DropdownMenuItem)[] => {
        const actions: (DropdownMenuItem[] | DropdownMenuItem)[] = [];

        if (item.permissions.update) {
            actions.push({
                text: <DropdownAction icon={PencilToLine} text={i18n('action_edit')} />,
                action: () => {
                    if (item?.workbookId) {
                        dispatch(
                            openDialog({
                                id: DIALOG_EDIT_WORKBOOK,
                                props: {
                                    open: true,
                                    workbookId: item.workbookId,
                                    title: item.title,
                                    description: item?.description ?? '',
                                    onApply: (workbook: UpdateWorkbookResponse | null) => {
                                        if (workbook) {
                                            refreshContent();
                                        }
                                    },
                                    onClose: () => {
                                        dispatch(closeDialog());
                                    },
                                },
                            }),
                        );
                    }
                },
            });
        }

        if (item.permissions.move) {
            actions.push({
                text: <DropdownAction icon={ArrowRight} text={i18n('action_move')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_MOVE_WORKBOOK,
                            props: {
                                open: true,
                                workbookId: item.workbookId,
                                workbookTitle: item.title,
                                initialCollectionId: item.collectionId,
                                onApply: refreshContent,
                                onClose: handeCloseMoveDialog,
                            },
                        }),
                    );
                },
            });
        }

        if (item.permissions.copy) {
            actions.push({
                text: <DropdownAction icon={Copy} text={i18n('action_copy')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_COPY_WORKBOOK,
                            props: {
                                open: true,
                                workbookId: item.workbookId,
                                workbookTitle: item.title,
                                initialCollectionId: item.collectionId,
                                onApply: (workbookId) => {
                                    if (workbookId) {
                                        history.push(`/workbooks/${workbookId}`);
                                    }
                                },
                                onClose: handeCloseMoveDialog,
                            },
                        }),
                    );
                },
            });
        }

        if (collectionsAccessEnabled && item.permissions.listAccessBindings) {
            actions.push({
                text: <DropdownAction icon={LockOpen} text={i18n('action_access')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_IAM_ACCESS,
                            props: {
                                open: true,
                                resourceId: item.workbookId,
                                resourceType: ResourceType.Workbook,
                                resourceTitle: item.title,
                                parentId: item.collectionId,
                                canUpdate: item.permissions.updateAccessBindings,
                                onClose: () => {
                                    dispatch(closeDialog());
                                },
                            },
                        }),
                    );
                },
            });
        }
        const otherActions: DropdownMenuItem[] = [];
        if (item.permissions.delete) {
            otherActions.push({
                text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
                action: () => {
                    dispatch(
                        openDialog({
                            id: DIALOG_DELETE_WORKBOOK,
                            props: {
                                open: true,
                                workbookId: item.workbookId,
                                workbookTitle: item.title,
                                onSuccessApply: (id) => {
                                    dispatch(deleteWorkbookInItems(id));
                                },
                                onClose: () => {
                                    dispatch(closeDialog());
                                },
                            },
                        }),
                    );
                },
                theme: 'danger',
            });
        }

        actions.push([...otherActions]);
        return actions;
    };

    return (
        <div className={b()}>
            {collectionPageViewMode === CollectionPageViewMode.Grid ? (
                <CollectionContentGrid
                    contentItems={contentItems}
                    countItemsWithPermissionMove={countItemsWithPermissionMove}
                    getWorkbookActions={getWorkbookActions}
                    getCollectionActions={getCollectionActions}
                    onUpdateCheckbox={onUpdateCheckbox}
                    onSelectAll={onSelectAll}
                    selectedMap={selectedMap}
                    isOpenSelectionMode={isOpenSelectionMode}
                />
            ) : (
                <CollectionContentTable
                    contentItems={contentItems}
                    countItemsWithPermissionMove={countItemsWithPermissionMove}
                    getWorkbookActions={getWorkbookActions}
                    getCollectionActions={getCollectionActions}
                    onUpdateCheckbox={onUpdateCheckbox}
                    onSelectAll={onSelectAll}
                    selectedMap={selectedMap}
                    countSelected={countSelected}
                    canMove={canMove}
                />
            )}

            {Boolean(countSelected) && (
                <BatchPanel
                    count={countSelected}
                    onAction={setBatchAction}
                    className={b('batch-panel')}
                    onClose={resetSelected}
                />
            )}

            {isContentLoading && <SmartLoader className={b('loader')} size="m" showAfter={0} />}
            {!isContentLoading && !waypointDisabled && <Waypoint onEnter={onWaypointEnter} />}
        </div>
    );
};
