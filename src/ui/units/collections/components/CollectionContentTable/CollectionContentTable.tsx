import React, {MouseEventHandler} from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {DropdownMenu, DropdownMenuItem} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {
    DIALOG_COPY_WORKBOOK,
    DIALOG_EDIT_COLLECTION,
    DIALOG_EDIT_WORKBOOK,
    DIALOG_MOVE_COLLECTION,
    DIALOG_MOVE_WORKBOOK,
} from 'components/CollectionsStructure';
import {IamAccessDialog} from 'components/IamAccessDialog/IamAccessDialog';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {Link, useHistory} from 'react-router-dom';
import type {
    CollectionWithPermissions,
    UpdateCollectionResponse,
    UpdateWorkbookResponse,
    WorkbookWithPermissions,
} from 'shared/schema';

import {Feature} from '../../../../../shared';
import {CollectionContentFilters} from '../../../../components/CollectionFilters/CollectionFilters';
import {IconById} from '../../../../components/IconById/IconById';
import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {ResourceType} from '../../../../registry/units/common/types/components/IamAccessDialog';
import {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import Utils from '../../../../utils';
import {DeleteCollectionDialogContainer} from '../../containers/DeleteCollectionDialogContainer/DeleteCollectionDialogContainer';
import {DeleteWorkbookDialogContainer} from '../../containers/DeleteWorkbookDialogContainer/DeleteWorkbookDialogContainer';
import {updateCollectionInItems, updateWorkbookInItems} from '../../store/actions';

import './CollectionContentTable.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-content-table');

const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';

export enum DialogState {
    None = 'none',
    EditCollectionAccess = 'editCollectionAccess',
    EditWorkbookAccess = 'editWorkbookAccess',
    DeleteCollection = 'deleteCollection',
    DeleteWorkbook = 'deleteWorkbook',
}

const onClickStopPropagation: MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
};

type Props = {
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    filters: CollectionContentFilters;
    setFilters: (filters: CollectionContentFilters) => void;
    refreshContent: () => void;
};

export const CollectionContentTable = React.memo<Props>(
    ({contentItems, filters, setFilters, refreshContent}) => {
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

        const getCollectionActions = (item: CollectionWithPermissions) => {
            const actions: DropdownMenuItem[] = [];

            if (item.permissions.update) {
                actions.push({
                    text: i18n('action_edit'),
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
                    text: i18n('action_move'),
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
                    text: i18n('action_access'),
                    action: () => {
                        setDialogState(DialogState.EditCollectionAccess);
                        setDialogEntity(item);
                    },
                });
            }

            if (item.permissions.delete) {
                actions.push({
                    text: i18n('action_delete'),
                    action: () => {
                        setDialogState(DialogState.DeleteCollection);
                        setDialogEntity(item);
                    },
                    theme: 'danger',
                });
            }

            return actions;
        };

        const getWorkbookActions = (item: WorkbookWithPermissions) => {
            const actions: DropdownMenuItem[] = [];

            if (item.permissions.update) {
                actions.push({
                    text: i18n('action_edit'),
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
                    text: i18n('action_move'),
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
                    text: i18n('action_copy'),
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
                    text: i18n('action_access'),
                    action: () => {
                        setDialogState(DialogState.EditWorkbookAccess);
                        setDialogEntity(item);
                    },
                });
            }

            if (item.permissions.delete) {
                actions.push({
                    text: i18n('action_delete'),
                    action: () => {
                        setDialogState(DialogState.DeleteWorkbook);
                        setDialogEntity(item);
                    },
                    theme: 'danger',
                });
            }

            return actions;
        };

        return (
            <div className={b()}>
                <div className={b('table')}>
                    <div className={b('header')}>
                        <div className={b('header-row')}>
                            <div className={b('header-cell')}>{i18n('label_title')}</div>
                            <div className={b('header-cell')}>{i18n('label_last-modified')}</div>
                            <div className={b('header-cell')} />
                        </div>
                    </div>
                    <div className={b('content')}>
                        {contentItems.map((item) => {
                            if ('workbookId' in item) {
                                const actions = getWorkbookActions(item);
                                return (
                                    <Link
                                        key={item.workbookId}
                                        to={`/workbooks/${item.workbookId}`}
                                        className={b('content-row')}
                                        onClick={() => {
                                            setFilters({...filters, filterString: undefined});
                                        }}
                                    >
                                        <div className={b('content-cell', {title: true})}>
                                            <div className={b('title-col')}>
                                                <div className={b('title-col-icon')}>
                                                    <WorkbookIcon title={item.title} />
                                                </div>
                                                <div className={b('title-col-text')}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={b('content-cell')}>
                                            {dateTime({
                                                input: item.updatedAt,
                                            }).format(DATETIME_FORMAT)}
                                        </div>
                                        <div className={b('content-cell', {control: true})}>
                                            {actions.length > 0 && (
                                                <div onClick={onClickStopPropagation}>
                                                    <DropdownMenu
                                                        size="s"
                                                        items={getWorkbookActions(item)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            } else {
                                const actions = getCollectionActions(item);
                                return (
                                    <Link
                                        key={item.collectionId}
                                        to={`/collections/${item.collectionId}`}
                                        className={b('content-row')}
                                        onClick={() => {
                                            setFilters({...filters, filterString: undefined});
                                        }}
                                    >
                                        <div className={b('content-cell', {title: true})}>
                                            <div className={b('title-col')}>
                                                <div className={b('title-col-icon')}>
                                                    <IconById id="collectionColored" size={32} />
                                                </div>
                                                <div className={b('title-col-text')}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={b('content-cell')}>
                                            {dateTime({
                                                input: item.updatedAt,
                                            }).format(DATETIME_FORMAT)}
                                        </div>
                                        <div
                                            className={b('content-cell', {control: true})}
                                            onClick={onClickStopPropagation}
                                        >
                                            {actions.length > 0 ? (
                                                <div>
                                                    <DropdownMenu
                                                        size="s"
                                                        items={getCollectionActions(item)}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </Link>
                                );
                            }
                        })}
                    </div>
                </div>

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
            </div>
        );
    },
);

CollectionContentTable.displayName = 'CollectionContentTable';
