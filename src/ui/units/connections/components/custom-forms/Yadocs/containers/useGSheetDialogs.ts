import React from 'react';

import {get} from 'lodash';
import {batch, useDispatch} from 'react-redux';

import {closeDialog, openDialog} from '../../../../../../store/actions/dialog';
import type {UploadedYadoc} from '../../../../store';
import {setYadocsActiveDialog, yadocToSourcesInfo} from '../../../../store';
import {DIALOG_CONN_S3_SOURCES} from '../../../dialogs';

type OpenSourcesDialogArgs = {
    yadoc: UploadedYadoc;
    batch?: boolean;
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

    return {openSourcesDialog};
};
