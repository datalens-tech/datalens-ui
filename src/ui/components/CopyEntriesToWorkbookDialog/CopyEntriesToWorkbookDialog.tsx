import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {ErrorContent} from 'ui/index';

import type {AppDispatch} from '../../store';
import {
    copyEntriesToWorkbook,
    getEntry,
    getRelations,
    resetState,
} from '../../store/actions/copyEntriesToWorkbook';
import {closeDialog, openDialog} from '../../store/actions/dialog';
import {
    selectIsLoadingRelations,
    selectIsLoadingTargetEntry,
    selectRelations,
    selectRelationsError,
    selectTargetEntry,
    selectTargetEntryError,
} from '../../store/selectors/copyEntriesToWorkbook';
import {DIALOG_COPY_ENTRIES} from '../CollectionsStructure';
import DialogManager from '../DialogManager/DialogManager';
import {SmartLoader} from '../SmartLoader/SmartLoader';

import {Body} from './components/Body';
import {checkFileConnection} from './utils';

import './CopyEntriesToWorkbookDialog.scss';

const b = block('dl-copy-entries-workbook-dialog');

const i18n = I18n.keyset('component.copy-entry-to-workbook-dialog');

export interface Props {
    open: boolean;
    entryId: string;
    initialCollectionId?: string | null;
    onClose: () => void;
}

export interface OpenDialogCopyEntriesToWorkbookArgs {
    id: typeof DIALOG_COPY_ENTRIES_TO_WORKBOOK;
    props: Props;
}

export const DIALOG_COPY_ENTRIES_TO_WORKBOOK = Symbol('DIALOG_COPY_ENTRIES_TO_WORKBOOK');

export const CopyEntriesToWorkbookDialog: React.FC<Props> = ({
    open,
    entryId,
    initialCollectionId = null,
    onClose,
}) => {
    const [isLoadingInited, setIsLoadingInited] = React.useState(false);

    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const isLoadingTargetEntry = useSelector(selectIsLoadingTargetEntry);
    const isLoadingRelations = useSelector(selectIsLoadingRelations);

    const targetEntry = useSelector(selectTargetEntry);

    const relations = useSelector(selectRelations);

    const isLoading = isLoadingTargetEntry || isLoadingRelations;

    const targetEntryError = useSelector(selectTargetEntryError);
    const relationsError = useSelector(selectRelationsError);
    const requestError = targetEntryError || relationsError;

    const isError = !isLoading && requestError !== null;
    const hasFileConnection = relations?.some(checkFileConnection);

    React.useEffect(() => {
        const promises: CancellablePromise<unknown>[] = [];

        if (open) {
            dispatch(resetState());
            setIsLoadingInited(true);

            promises.push(dispatch(getEntry({entryId})));
            promises.push(dispatch(getRelations({entryId})));
        }

        return () => {
            promises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [open, entryId, dispatch]);

    const handleButtonApply = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_COPY_ENTRIES,
                props: {
                    open: true,
                    initialCollectionId,
                    onApply: async (workbookId: string) => {
                        if (targetEntry && relations) {
                            await dispatch(
                                copyEntriesToWorkbook({
                                    workbookId,
                                    entryIds: [
                                        targetEntry.entryId,
                                        ...relations.map((entry) => entry.entryId),
                                    ],
                                }),
                            ).then((response) => {
                                dispatch(closeDialog());

                                if (response?.workbookId) {
                                    history.push(
                                        `/workbooks/${response.workbookId}?tab=all&dialog=access`,
                                    );
                                }
                            });
                        }
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [dispatch, history, initialCollectionId, relations, targetEntry]);

    if (!isLoadingInited) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} size="m">
            <div className={b()}>
                <Dialog.Header caption={i18n('title')} />
                <Dialog.Body className={b('body')}>
                    {isLoading ? (
                        <SmartLoader size="m" showAfter={0} />
                    ) : (
                        <React.Fragment>
                            {isError || targetEntry === null || relations === null ? (
                                <ErrorContent
                                    className={b('error-block')}
                                    error={requestError}
                                    description={
                                        <div className={b('error')}>
                                            {requestError?.message || i18n('label_unknown-error')}
                                        </div>
                                    }
                                />
                            ) : (
                                <Body targetEntry={targetEntry} relations={relations} />
                            )}
                        </React.Fragment>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('action_copy')}
                    propsButtonApply={{
                        disabled: hasFileConnection || isLoading || isError,
                    }}
                    textButtonCancel={i18n('action_cancel')}
                    onClickButtonApply={handleButtonApply}
                    onClickButtonCancel={onClose}
                />
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_COPY_ENTRIES_TO_WORKBOOK, CopyEntriesToWorkbookDialog);
