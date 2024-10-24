import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {get} from 'lodash';
import {batch, useDispatch} from 'react-redux';

import type {RefreshToken} from '../../../../../../../shared/schema/types';
import {closeDialog, openDialog} from '../../../../../../store/actions/dialog';
import type {GSheetItem, UpdateGSheetItemArgs, UploadedGSheet} from '../../../../store';
import {
    api,
    googleLogout,
    gsheetToSourcesInfo,
    handleGSheetBeforeReplaceSource,
    setGSheetActiveDialog,
    showGsheetUploadingFailureToast,
    updateGSheetItem,
} from '../../../../store';
import {DIALOG_CONN_CONFIRM, DIALOG_CONN_S3_SOURCES} from '../../../dialogs';
import {DIALOG_CONN_WITH_INPUT} from '../../components';

const b = block('conn-form-gsheets');
const i18n = I18n.keyset('connections.gsheet.view');

type OpenSourcesDialogArgs = {
    gsheet: UploadedGSheet;
    batch?: boolean;
};

type OpenRenameSourceDialogArgs = {
    type: GSheetItem['type'];
    sourceId: string;
    caption: string;
    value?: string;
};

type OpenReplaceSourceDialogArgs = {
    sourceId: string;
    caption: string;
    authorized: boolean;
    connectionId?: string;
    refreshToken?: RefreshToken;
};

export const useGSheetDialogs = () => {
    const dispatch = useDispatch();

    const closeGSheetDialog = React.useCallback(() => {
        batch(() => {
            dispatch(closeDialog());
            dispatch(setGSheetActiveDialog({activeDialog: undefined}));
        });
    }, [dispatch]);

    const getApplySourcesDialog = React.useCallback(
        (fileId: string) => {
            return (sourcesId: string[]) => {
                batch(() => {
                    dispatch(gsheetToSourcesInfo(fileId, sourcesId));
                    closeGSheetDialog();
                });
            };
        },
        [dispatch, closeGSheetDialog],
    );

    const getApplyRenameDialog = React.useCallback(
        (type: GSheetItem['type'], sourceId: string) => {
            return (title: string) => {
                let updates: UpdateGSheetItemArgs['updates'] = {};

                switch (type) {
                    case 'gsheetEditableSource': {
                        updates = {data: {source: {title}}};
                        break;
                    }
                    case 'gsheetReadonlySource': {
                        updates = {data: {title}};
                    }
                }

                batch(() => {
                    dispatch(
                        updateGSheetItem({
                            id: sourceId,
                            shouldUpdateForm: true,
                            updates,
                        }),
                    );
                    closeGSheetDialog();
                });
            };
        },
        [dispatch, closeGSheetDialog],
    );

    const getSuccessReplaceDialog = React.useCallback(
        (sourceId: string) => {
            return ({gsheet}: {gsheet?: UploadedGSheet['data']}) => {
                if (gsheet) {
                    batch(() => {
                        dispatch(handleGSheetBeforeReplaceSource(gsheet, sourceId));
                        closeGSheetDialog();
                    });
                }
            };
        },
        [dispatch, closeGSheetDialog],
    );

    const getApplyLogoutDialog = React.useCallback(() => {
        return () => {
            batch(() => {
                dispatch(googleLogout());
                closeGSheetDialog();
            });
        };
    }, [dispatch, closeGSheetDialog]);

    const openSourcesDialog = React.useCallback(
        (args: OpenSourcesDialogArgs) => {
            const fileId = get(args, ['gsheet', 'data', 'file_id']);
            const sourcesInfo = get(args, ['gsheet', 'data', 'sources']);
            dispatch(
                openDialog({
                    id: DIALOG_CONN_S3_SOURCES,
                    props: {
                        sourcesInfo,
                        batch: args.batch,
                        onApply: getApplySourcesDialog(fileId),
                        onClose: closeGSheetDialog,
                    },
                }),
            );
        },
        [dispatch, getApplySourcesDialog, closeGSheetDialog],
    );

    const openRenameSourceDialog = React.useCallback(
        (args: OpenRenameSourceDialogArgs) => {
            const {type, sourceId, caption, value} = args;
            dispatch(
                openDialog({
                    id: DIALOG_CONN_WITH_INPUT,
                    props: {
                        caption,
                        value,
                        applyMode: 'sync',
                        onApply: getApplyRenameDialog(type, sourceId),
                        onClose: closeGSheetDialog,
                    },
                }),
            );
        },
        [dispatch, getApplyRenameDialog, closeGSheetDialog],
    );

    const openReplaceSourceDialog = React.useCallback(
        (args: OpenReplaceSourceDialogArgs) => {
            const {sourceId, caption, refreshToken, connectionId, authorized} = args;
            dispatch(
                openDialog({
                    id: DIALOG_CONN_WITH_INPUT,
                    props: {
                        caption,
                        applyMode: 'async',
                        onApply: (url: string) => {
                            return api.addGoogleSheet({
                                url,
                                refreshToken,
                                connectionId,
                                authorized,
                            });
                        },
                        onError: (error) => dispatch(showGsheetUploadingFailureToast(error)),
                        onSuccess: getSuccessReplaceDialog(sourceId),
                        onClose: closeGSheetDialog,
                    },
                }),
            );
        },
        [dispatch, getSuccessReplaceDialog, closeGSheetDialog],
    );

    const openLogoutDialog = React.useCallback(() => {
        const onApply = getApplyLogoutDialog();
        dispatch(
            openDialog({
                id: DIALOG_CONN_CONFIRM,
                props: {
                    description: i18n('label_logout-dialog-description'),
                    dialogProps: {
                        className: b('dialog-logout'),
                        onEnterKeyDown: onApply,
                    },
                    headerProps: {
                        caption: i18n('label_logout-dialog-title'),
                    },
                    footerProps: {
                        textButtonCancel: i18n('button_cancel'),
                        textButtonApply: i18n('button_google-logout'),
                    },
                    onApply,
                    onClose: closeGSheetDialog,
                },
            }),
        );
    }, [dispatch, getApplyLogoutDialog, closeGSheetDialog]);

    return {openSourcesDialog, openRenameSourceDialog, openReplaceSourceDialog, openLogoutDialog};
};
