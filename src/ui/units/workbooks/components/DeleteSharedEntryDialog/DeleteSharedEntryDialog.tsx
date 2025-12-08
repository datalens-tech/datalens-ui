import React from 'react';

import {Alert, Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
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
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';
import {groupEntitiesByScope} from 'ui/utils/helpers';

import type {WorkbookSharedEntry} from '../../types';

import ArrowsRotateRightIcon from '@gravity-ui/icons/svgs/arrows-rotate-right.svg';

import './DeleteSharedEntryDialog.scss';

export type Props = {
    open: boolean;
    entry: WorkbookSharedEntry;
    workbookId: string;
    onDeleteSuccess?: () => void;
    onClose: () => void;
};

export const DIALOG_DELETE_SHARED_ENTRY_IN_WORKBOOK = Symbol(
    'DIALOG_DELETE_SHARED_ENTRY_IN_WORKBOOK',
);

export type OpenDialogDeleteSharedEntryInWorkbookArgs = {
    id: typeof DIALOG_DELETE_SHARED_ENTRY_IN_WORKBOOK;
    props: Props;
};

type Entities = {
    [K in EntryScope]?: SharedEntryRelationFields[];
};

const b = block('dl-shared-entry-workbook-delete-dialog');

const CONCURRENT_ID = 'shared-entry-workbook-deleting';
const cancelConcurrentRequest = () => getSdk().cancelRequest(CONCURRENT_ID);

export const getRelationText = (entities: Entities | null) => {
    const hasDataset = Boolean(entities?.[EntryScope.Dataset]);
    const hasDash = Boolean(entities?.[EntryScope.Dash]);
    const hasWidget = Boolean(entities?.[EntryScope.Widget]);

    if ([hasDash, hasDataset, hasWidget].filter(Boolean).length > 1) {
        return getSharedEntryMockText('relations-workbook-dialog-delete');
    } else if (hasDataset) {
        return getSharedEntryMockText('relation-dataset-bindings-dialog-delete');
    } else if (hasDash) {
        return getSharedEntryMockText('relation-dash-workbook-dialog-delete');
    } else if (hasWidget) {
        return getSharedEntryMockText('relation-chart-workbook-dialog-delete');
    } else {
        return '';
    }
};

const DeleteSharedEntryDialog = React.memo<Props>(
    ({open, entry, onClose, workbookId, onDeleteSuccess}) => {
        const dispatch: AppDispatch = useDispatch();
        const [entities, setEntities] = React.useState<Entities | null>(null);
        const [isLoading, setIsLoading] = React.useState(true);
        const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);
        const [isError, setIsError] = React.useState(false);

        const isListEmpty = isEmpty(entities);
        const alertTheme = isListEmpty ? 'info' : 'warning';
        const alertTitle = getSharedEntryMockText(
            isListEmpty
                ? 'alert-title-info-bindings-dialog-delete'
                : 'alert-title-warning-bindings-dialog-delete',
            {
                entry: getSharedEntryMockText(`label-shared-${entry.scope}`),
                relation: getRelationText(entities),
            },
        );
        const alertMessage = getSharedEntryMockText(
            isListEmpty
                ? 'alert-message-info-workbook-dialog-delete'
                : 'alert-message-warning-workbook-dialog-delete',
        );
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
                        {getSharedEntryMockText('bindings-dialog-retry-btn')}
                    </Button>
                );

                return (
                    <div className={b('error-state')}>
                        <PlaceholderIllustration
                            direction="column"
                            name="error"
                            title={getSharedEntryMockText('bindings-dialog-error')}
                            renderAction={renderRetryAction}
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
                <Dialog.Header
                    caption={getSharedEntryMockText('title-bindings-dialog-delete', {
                        entry: getSharedEntryMockText(
                            `label-shared-${entry.scope}`,
                        ).toLocaleLowerCase(),
                    })}
                />
                <Dialog.Body className={b('body')}>
                    <EntitiesList
                        entities={[entry]}
                        title={getSharedEntryMockText('label-current-entry')}
                        className={b('current-row')}
                        rightSectionSlot={() => <SharedEntryIcon entry={entry} />}
                    />
                    {isLoading ? (
                        <SmartLoader showAfter={0} />
                    ) : (
                        <>
                            <Alert theme={alertTheme} title={alertTitle} message={alertMessage} />
                            {!isListEmpty && <div className={b('list')}>{renderRelations()}</div>}
                        </>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={getSharedEntryMockText('apply-bindings-dialog-delete')}
                    propsButtonApply={{
                        view: 'outlined-danger',
                    }}
                    propsButtonCancel={{
                        view: 'flat',
                    }}
                    className={b('footer')}
                    loading={isLoading || isLoadingDelete}
                    textButtonCancel={getSharedEntryMockText('cancel-bindings-dialog-delete')}
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
                        {getSharedEntryMockText('bindings-dialog-delete-refresh-btn')}
                    </Button>
                </Dialog.Footer>
            </Dialog>
        );
    },
);

DeleteSharedEntryDialog.displayName = 'DeleteSharedEntryDialog';

DialogManager.registerDialog(DIALOG_DELETE_SHARED_ENTRY_IN_WORKBOOK, DeleteSharedEntryDialog);
