import React from 'react';

import {Alert, Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {useDispatch} from 'react-redux';
import {EntryScope} from 'shared';
import type {SharedEntryRelationFields} from 'shared/schema';
import DialogManager from 'ui/components/DialogManager/DialogManager';
import {EntitiesList} from 'ui/components/EntitiesList/EntitiesList';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {SharedEntryIcon} from 'ui/components/SharedEntryIcon/SharedEntryIcon';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import {getSdk} from 'ui/libs/schematic-sdk';
import type {AppDispatch} from 'ui/store';
import {showToast} from 'ui/store/actions/toaster';
import {groupEntitiesByScope} from 'ui/utils/helpers';

import type {SharedEntry} from '../DialogSharedEntryBindings/types';

import ArrowsRotateRightIcon from '@gravity-ui/icons/svgs/arrows-rotate-right.svg';

import './DialogSharedRelatedEntities.scss';

export type Props = {
    open: boolean;
    entry: SharedEntry;
    workbookId: string;
    isDeleteDialog?: boolean;
    onDeleteSuccess?: () => void;
    onClose: () => void;
};

export const DIALOG_SHARED_RELATED_ENTITIES = Symbol('DIALOG_SHARED_RELATED_ENTITIES');

export type OpenDialogSharedRelatedEntitiesArgs = {
    id: typeof DIALOG_SHARED_RELATED_ENTITIES;
    props: Props;
};

type Entities = {
    [K in EntryScope]?: SharedEntryRelationFields[];
};

const i18n = I18n.keyset('component.dialog-shared-related-entities.view');
const b = block('dl-shared-related-entities-dialog');

const CONCURRENT_ID = 'list-shared-related-entities';
const cancelConcurrentRequest = () => getSdk().cancelRequest(CONCURRENT_ID);

export const getRelationText = (entities: Entities | null) => {
    const hasDataset = Boolean(entities?.[EntryScope.Dataset]);
    const hasDash = Boolean(entities?.[EntryScope.Dash]);
    const hasWidget = Boolean(entities?.[EntryScope.Widget]);

    if ([hasDash, hasDataset, hasWidget].filter(Boolean).length > 1) {
        return i18n('relations');
    } else if (hasDataset) {
        return i18n('relation-dataset');
    } else if (hasDash) {
        return i18n('relation-dash');
    } else if (hasWidget) {
        return i18n('relation-chart');
    } else {
        return '';
    }
};

const SharedRelatedEntitiesDialog = React.memo<Props>(
    ({open, entry, onClose, workbookId, isDeleteDialog, onDeleteSuccess}) => {
        const dispatch: AppDispatch = useDispatch();
        const [entities, setEntities] = React.useState<Entities | null>(null);
        const [isLoading, setIsLoading] = React.useState(true);
        const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);
        const [isError, setIsError] = React.useState(false);

        const scope = entry.scope as EntryScope.Connection | EntryScope.Dataset;

        const isListEmpty = isEmpty(entities);
        const dialogTitle = isDeleteDialog
            ? i18n('title-dialog-delete', {
                  entry: i18n(`label-shared-${scope}`).toLocaleLowerCase(),
              })
            : i18n('dialog-title');
        const alertTheme = isListEmpty ? 'info' : 'warning';
        const alertTitle = i18n(isListEmpty ? 'alert-title-info' : 'alert-title-warning', {
            entry: i18n(`label-shared-${scope}`),
            relation: getRelationText(entities),
        });
        const alertMessage = i18n(isListEmpty ? 'alert-message-info' : 'alert-message-warning');
        const fetchEntityRelations = React.useCallback(() => {
            setIsLoading(true);
            setIsError(false);
            cancelConcurrentRequest();
            getSdk()
                .sdk.us.getSharedEntryWorkbookRelations({
                    entryId: entry.entryId,
                    workbookId,
                })
                .then((response) => {
                    setEntities(groupEntitiesByScope(response.relations));
                    setIsLoading(false);
                })
                .catch((error) => {
                    if (error.isCancelled) {
                        return;
                    }
                    setIsError(true);
                    setIsLoading(false);
                });
        }, [entry, workbookId]);

        const onDelete = React.useCallback(async () => {
            setIsLoadingDelete(true);
            try {
                await getSdk().sdk.us.deleteSharedEntryBinding({
                    sourceId: entry.entryId,
                    targetId: workbookId,
                });
                setIsLoadingDelete(false);
                onDeleteSuccess?.();
            } catch (error) {
                setIsLoadingDelete(false);
                dispatch(
                    showToast({
                        title: error.message,
                        error,
                    }),
                );
            }
        }, [entry, workbookId, dispatch, onDeleteSuccess]);

        const renderRelations = () => {
            if (isError) {
                const renderRetryAction = () => (
                    <Button
                        className={b('button-retry')}
                        size="l"
                        view="action"
                        onClick={fetchEntityRelations}
                    >
                        {i18n('retry-btn')}
                    </Button>
                );

                return (
                    <div className={b('error-state')}>
                        <PlaceholderIllustration
                            direction="column"
                            name="error"
                            title={i18n('dialog-error')}
                            renderAction={renderRetryAction}
                        />
                    </div>
                );
            }

            if (isListEmpty && !isDeleteDialog) {
                return (
                    <div className={b('empty-state')}>
                        <PlaceholderIllustration
                            direction="column"
                            name="emptyDirectory"
                            title={i18n('related-entities-list-empty')}
                        />
                    </div>
                );
            }

            return Object.entries(entities ?? {}).map(([key, value]) => (
                <EntitiesList enableHover={true} scope={key} entities={value} key={key} />
            ));
        };

        React.useEffect(() => {
            fetchEntityRelations();
        }, [fetchEntityRelations]);

        return (
            <Dialog open={open} onClose={onClose} className={b()} size="m">
                <Dialog.Header caption={dialogTitle} />
                <Dialog.Body className={b('body', {isDeleteDialog})}>
                    <EntitiesList
                        entities={[entry]}
                        title={i18n('label-current-entry')}
                        className={b('current-row', {isDeleteDialog})}
                        rightSectionSlot={() => <SharedEntryIcon isDelegated={entry.isDelegated} />}
                    />
                    {isLoading ? (
                        <SmartLoader showAfter={0} />
                    ) : (
                        <>
                            {isDeleteDialog && (
                                <Alert
                                    theme={alertTheme}
                                    title={alertTitle}
                                    message={alertMessage}
                                />
                            )}
                            {(!isListEmpty || !isDeleteDialog) && (
                                <div className={b('list')}>{renderRelations()}</div>
                            )}
                        </>
                    )}
                </Dialog.Body>
                {isDeleteDialog && (
                    <Dialog.Footer
                        textButtonApply={i18n('apply-text')}
                        propsButtonApply={{
                            view: 'outlined-danger',
                        }}
                        propsButtonCancel={{
                            view: 'flat',
                        }}
                        className={b('footer')}
                        loading={isLoading || isLoadingDelete}
                        textButtonCancel={i18n('cancel-text')}
                        onClickButtonApply={onDelete}
                        onClickButtonCancel={onClose}
                    >
                        <Button
                            loading={isLoading || isLoadingDelete}
                            view="outlined"
                            size="l"
                            onClick={() => fetchEntityRelations()}
                        >
                            <Icon data={ArrowsRotateRightIcon} />
                            {i18n('refresh-btn')}
                        </Button>
                    </Dialog.Footer>
                )}
            </Dialog>
        );
    },
);

SharedRelatedEntitiesDialog.displayName = 'SharedRelatedEntitiesDialog';

DialogManager.registerDialog(DIALOG_SHARED_RELATED_ENTITIES, SharedRelatedEntitiesDialog);
