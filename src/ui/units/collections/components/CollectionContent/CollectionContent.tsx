import React from 'react';

import {ArrowRight, Copy, LockOpen, PencilToLine, TrashBin} from '@gravity-ui/icons';
import {CancellablePromise} from '@gravity-ui/sdk';
import {Button, DropdownMenuItem} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {
    DIALOG_COPY_WORKBOOK,
    DIALOG_EDIT_COLLECTION,
    DIALOG_EDIT_WORKBOOK,
    DIALOG_MOVE_COLLECTION,
    DIALOG_MOVE_WORKBOOK,
} from 'components/CollectionsStructure';
import {IamAccessDialog} from 'components/IamAccessDialog/IamAccessDialog';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
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
import {ResourceType} from '../../../../registry/units/common/types/components/IamAccessDialog';
import {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import Utils from '../../../../utils';
import {DeleteCollectionDialogContainer} from '../../containers/DeleteCollectionDialogContainer/DeleteCollectionDialogContainer';
import {DeleteWorkbookDialogContainer} from '../../containers/DeleteWorkbookDialogContainer/DeleteWorkbookDialogContainer';
import {updateCollectionInItems, updateWorkbookInItems} from '../../store/actions';
import {GetCollectionContentArgs} from '../../types';
import {CollectionContentGrid} from '../CollectionContentGrid/CollectionContentGrid';
import {CollectionContentTable} from '../CollectionContentTable/CollectionContentTable';
import {ContentProps} from '../types';

import {DropdownAction} from './DropdownAction/DropdownAction';

import './CollectionContent.scss';

export enum DialogState {
    None = 'none',
    EditCollectionAccess = 'editCollectionAccess',
    EditWorkbookAccess = 'editWorkbookAccess',
    DeleteCollection = 'deleteCollection',
    DeleteWorkbook = 'deleteWorkbook',
}

const b = block('dl-collection-content');
const i18n = I18n.keyset('collections');

interface Props extends ContentProps {
    collectionId: string | null;
    pageSize: number;
    collectionPageViewMode: CollectionPageViewMode;
    isDefaultFilters: boolean;
    isContentLoading: boolean;
    isOpenSelectionMode: boolean;
    contentLoadingError: Error | null;
    canCreateWorkbook: boolean;
    nextPageTokens: {
        collectionsNextPageToken?: string | null;
        workbooksNextPageToken?: string | null;
    };
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
    setFilters,
    isDefaultFilters,
    canCreateWorkbook,
    isContentLoading,
    isOpenSelectionMode,
    contentLoadingError,
    contentItems,
    selectedMap,
    countSelected,
    nextPageTokens,
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

    const [dialogState, setDialogState] = React.useState(DialogState.None);
    const [dialogEntity, setDialogEntity] = React.useState<
        CollectionWithPermissions | WorkbookWithPermissions | null
    >(null);

    const handleCloseDialog = React.useCallback(() => {
        setDialogState(DialogState.None);
        setDialogEntity(null);
    }, []);

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
        if (canCreateWorkbook) {
            return (
                <Button className={b('controls')} onClick={onClearFiltersClick}>
                    {i18n('action_clear-filters')}
                </Button>
            );
        }
        return null;
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
                    setDialogEntity(item);

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
                                        dispatch(updateCollectionInItems(collection));
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
                    setDialogState(DialogState.EditCollectionAccess);
                    setDialogEntity(item);
                },
            });
        }

        const otherActions: DropdownMenuItem[] = [];
        if (item.permissions.delete) {
            otherActions.push({
                text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
                action: () => {
                    setDialogState(DialogState.DeleteCollection);
                    setDialogEntity(item);
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
                                            dispatch(updateWorkbookInItems(workbook));
                                        }
                                    },
                                    onClose: () => {
                                        dispatch(closeDialog());
                                    },
                                },
                            }),
                        );
                    }

                    setDialogEntity(item);
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
                    setDialogState(DialogState.EditWorkbookAccess);
                    setDialogEntity(item);
                },
            });
        }
        const otherActions: DropdownMenuItem[] = [];
        if (item.permissions.delete) {
            otherActions.push({
                text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
                action: () => {
                    setDialogState(DialogState.DeleteWorkbook);
                    setDialogEntity(item);
                },
                theme: 'danger',
            });
        }

        actions.push([...otherActions]);
        return actions;
    };

    const contentProps = {
        contentItems,
        filters,
        setFilters,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckbox,
        onSelectAll,
        selectedMap,
        countSelected,
    };

    return (
        <React.Fragment>
            {collectionPageViewMode === CollectionPageViewMode.Grid ? (
                <CollectionContentGrid
                    {...contentProps}
                    isOpenSelectionMode={isOpenSelectionMode}
                />
            ) : (
                <CollectionContentTable {...contentProps} />
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
            {dialogEntity && (
                <React.Fragment>
                    {'workbookId' in dialogEntity ? (
                        <React.Fragment>
                            <DeleteWorkbookDialogContainer
                                open={dialogState === DialogState.DeleteWorkbook}
                                workbookId={dialogEntity.workbookId}
                                workbookTitle={dialogEntity.title}
                                deleteInItems={true}
                                onClose={handleCloseDialog}
                            />
                            {collectionsAccessEnabled && (
                                <IamAccessDialog
                                    open={dialogState === DialogState.EditWorkbookAccess}
                                    resourceId={dialogEntity.workbookId}
                                    resourceType={ResourceType.Workbook}
                                    resourceTitle={dialogEntity.title}
                                    parentId={dialogEntity.collectionId}
                                    canUpdate={dialogEntity.permissions.updateAccessBindings}
                                    onClose={handleCloseDialog}
                                />
                            )}
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <DeleteCollectionDialogContainer
                                open={dialogState === DialogState.DeleteCollection}
                                collectionId={dialogEntity.collectionId}
                                deleteInItems={true}
                                onClose={handleCloseDialog}
                            />
                            {collectionsAccessEnabled && (
                                <IamAccessDialog
                                    open={dialogState === DialogState.EditCollectionAccess}
                                    resourceId={dialogEntity.collectionId}
                                    resourceType={ResourceType.Collection}
                                    resourceTitle={dialogEntity.title}
                                    parentId={dialogEntity.parentId}
                                    canUpdate={dialogEntity.permissions.updateAccessBindings}
                                    onClose={handleCloseDialog}
                                />
                            )}
                        </React.Fragment>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
