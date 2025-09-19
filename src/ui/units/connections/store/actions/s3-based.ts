import {I18n} from 'i18n';
import {get} from 'lodash';
import {batch} from 'react-redux';
import {ConnectorType} from 'shared';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import {showToast} from '../../../../store/actions/toaster';
import {getWorkbookIdFromPathname} from '../../../../utils';
import history from '../../../../utils/history';
import {FieldKey} from '../../constants';
import type {ConnectionsReduxDispatch, GetState} from '../typings';

import {api} from './api';
import {
    resetFormsData,
    resetS3BasedData,
    setFileReplaceSources,
    setInitialForm,
    setSubmitLoading,
} from './base';

import {setPageData} from '.';

const i18n = I18n.keyset('connections.form');

export const createS3BasedConnection = (args: {
    name: string;
    dirPath?: string;
    workbookId?: string;
}) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {name, dirPath, workbookId = getWorkbookIdFromPathname()} = args;
        const {form, annotation} = getState().connections;
        const placementData: Record<string, string> = dirPath
            ? {[FieldKey.DirPath]: dirPath}
            : {[FieldKey.WorkbookId]: workbookId};
        const resultForm = {
            ...form,
            ...placementData,
            [FieldKey.Name]: name,
        };

        dispatch(setSubmitLoading({loading: true}));

        const {id, error} = await api.createConnection(resultForm, annotation?.description ?? '');

        if (id) {
            batch(() => {
                // technotes [2]
                dispatch(resetFormsData());
                dispatch(resetS3BasedData());
            });
        }

        batch(() => {
            if (id) {
                history.replace(`/connections/${id}`);
            }

            if (error) {
                dispatch(
                    showToast({
                        error,
                        title: isEntryAlreadyExists(error)
                            ? i18n('label_entry-name-already-exists')
                            : i18n('toast_create-connection-error'),
                    }),
                );
            }

            dispatch(setSubmitLoading({loading: false}));
        });
    };
};

export const updateS3BasedConnection = (type?: ConnectorType) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(setSubmitLoading({loading: true}));

        const entry = get(getState().connections, ['entry']);
        const connectionData = get(getState().connections, ['connectionData']);
        const form = get(getState().connections, ['form']);
        const annotation = get(getState().connections, ['annotation']);

        const {error} = await api.updateConnection(
            form,
            connectionData.id as string,
            connectionData.db_type as string,
            annotation?.description ?? '',
        );

        batch(() => {
            if (error) {
                dispatch(
                    showToast({
                        error,
                        title: i18n('toast_create-connection-error'),
                    }),
                );
            } else {
                dispatch(setInitialForm({updates: form}));
                dispatch(setPageData({entryId: entry?.entryId}));

                switch (type) {
                    case ConnectorType.File: {
                        dispatch(setFileReplaceSources({replaceSources: []}));
                    }
                }
            }

            dispatch(setSubmitLoading({loading: false}));
        });
    };
};
