import React from 'react';

import {I18n} from 'i18n';
import {get} from 'lodash';
import {batch, useDispatch} from 'react-redux';

import {closeDialog, openDialog} from '../../../../../../store/actions/dialog';
import {
    api,
    handleReplacedSourceBeforePolling,
    handleUploadedYadocBeforePolling,
    oauthLogout,
    setYadocsActiveDialog,
    showGsheetUploadingFailureToast,
    updateYadocItem,
    yadocToSourcesInfo,
} from '../../../../store';
import type {
    UpdateYadocItemArgs,
    UploadedYadoc,
    YadocItem,
    YadocsActiveAddDocument,
    YadocsActiveDialogRename,
    YadocsActiveDialogReplace,
} from '../../../../store';
import {DIALOG_CONN_CONFIRM, DIALOG_CONN_S3_SOURCES} from '../../../dialogs';
import {DIALOG_CONN_WITH_INPUT} from '../../components';
import {DIALOG_CONN_ADD_YADOC} from '../components/DialogAddDocument/DialogAddDocument';

const i18n = I18n.keyset('connections.yadocs.view');

type OpenAddDocumentDialogArgs = Omit<YadocsActiveAddDocument, 'type'>;

type OpenSourcesDialogArgs = {
    yadoc: UploadedYadoc;
    batch?: boolean;
};

type OpenRenameSourceDialogArgs = Omit<YadocsActiveDialogRename, 'type'> & {
    caption: string;
    type: YadocItem['type'];
};

type OpenReplaceSourceDialogArgs = Omit<YadocsActiveDialogReplace, 'type'> & {
    caption: string;
    sourceId: string;
};

export const useYadocsDialogs = () => {
    const dispatch = useDispatch();

    const handleCloseDialog = React.useCallback(() => {
        batch(() => {
            dispatch(closeDialog());
            dispatch(setYadocsActiveDialog({activeDialog: undefined}));
        });
    }, [dispatch]);

    const getApplySourcesDialog = React.useCallback(
        (fileId: string) => {
            return (sourcesId: string[]) => {
                batch(() => {
                    dispatch(yadocToSourcesInfo(fileId, sourcesId));
                    handleCloseDialog();
                });
            };
        },
        [dispatch, handleCloseDialog],
    );

    const getApplyRenameDialog = React.useCallback(
        (type: YadocItem['type'], sourceId: string) => {
            return (title: string) => {
                let updates: UpdateYadocItemArgs['updates'] = {};

                switch (type) {
                    case 'yadocEditableSource': {
                        updates = {data: {source: {title}}};
                        break;
                    }
                    case 'yadocReadonlySource': {
                        updates = {data: {title}};
                    }
                }

                batch(() => {
                    dispatch(
                        updateYadocItem({
                            id: sourceId,
                            shouldUpdateForm: true,
                            updates,
                        }),
                    );
                    handleCloseDialog();
                });
            };
        },
        [dispatch, handleCloseDialog],
    );

    const getSuccessReplaceDialog = React.useCallback(
        (sourceId: string) => {
            return ({document}: {document?: UploadedYadoc['data']}) => {
                if (document) {
                    batch(() => {
                        dispatch(handleReplacedSourceBeforePolling(document, sourceId));
                        handleCloseDialog();
                    });
                }
            };
        },
        [dispatch, handleCloseDialog],
    );

    const getApplyLogoutDialog = React.useCallback(() => {
        return () => {
            batch(() => {
                dispatch(oauthLogout());
                handleCloseDialog();
            });
        };
    }, [dispatch, handleCloseDialog]);

    const openSourcesDialog = React.useCallback(
        (args: OpenSourcesDialogArgs) => {
            const fileId = get(args, ['yadoc', 'data', 'file_id']);
            const sourcesInfo = get(args, ['yadoc', 'data', 'sources']);
            dispatch(
                openDialog({
                    id: DIALOG_CONN_S3_SOURCES,
                    props: {
                        sourcesInfo,
                        batch: args.batch,
                        onApply: getApplySourcesDialog(fileId),
                        onClose: handleCloseDialog,
                    },
                }),
            );
        },
        [dispatch, getApplySourcesDialog, handleCloseDialog],
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
                        onClose: handleCloseDialog,
                    },
                }),
            );
        },
        [dispatch, getApplyRenameDialog, handleCloseDialog],
    );

    const openAddDocumentDialog = React.useCallback(
        (args: OpenAddDocumentDialogArgs) => {
            dispatch(
                openDialog({
                    id: DIALOG_CONN_ADD_YADOC,
                    props: {
                        onApply: (pathData) => {
                            return api.addYandexDocument({...pathData, ...args});
                        },
                        onClose: handleCloseDialog,
                        onError: (error) => dispatch(showGsheetUploadingFailureToast(error)),
                        onSuccess: ({document}) => {
                            if (document) {
                                batch(() => {
                                    dispatch(handleUploadedYadocBeforePolling(document));
                                    handleCloseDialog();
                                });
                            }
                        },
                    },
                }),
            );
        },
        [dispatch, handleCloseDialog],
    );

    const openReplaceSourceDialog = React.useCallback(
        (args: OpenReplaceSourceDialogArgs) => {
            const {sourceId, caption, oauthToken, authorized} = args;
            dispatch(
                openDialog({
                    id: DIALOG_CONN_ADD_YADOC,
                    props: {
                        caption,
                        onApply: (pathData) => {
                            return api.addYandexDocument({
                                ...pathData,
                                authorized,
                                oauthToken,
                            });
                        },
                        onClose: handleCloseDialog,
                        onError: (error) => dispatch(showGsheetUploadingFailureToast(error)),
                        onSuccess: getSuccessReplaceDialog(sourceId),
                    },
                }),
            );
        },
        [dispatch, getSuccessReplaceDialog, handleCloseDialog],
    );

    const openLogoutDialog = React.useCallback(() => {
        const onApply = getApplyLogoutDialog();
        dispatch(
            openDialog({
                id: DIALOG_CONN_CONFIRM,
                props: {
                    description: i18n('label_logout-dialog-description'),
                    dialogProps: {
                        onEnterKeyDown: onApply,
                    },
                    headerProps: {
                        caption: i18n('label_logout-dialog-title'),
                    },
                    footerProps: {
                        textButtonApply: i18n('button_apply'),
                        textButtonCancel: i18n('button_cancel'),
                    },
                    onApply,
                    onClose: handleCloseDialog,
                },
            }),
        );
    }, [dispatch, getApplyLogoutDialog, handleCloseDialog]);

    return {
        openAddDocumentDialog,
        openLogoutDialog,
        openRenameSourceDialog,
        openReplaceSourceDialog,
        openSourcesDialog,
    };
};
