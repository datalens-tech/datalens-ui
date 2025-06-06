import {I18n} from 'i18n';
import {get} from 'lodash';
import {batch} from 'react-redux';
import {ConnectorType} from 'shared';

import {showToast} from '../../../../../store/actions/toaster';
import type {DataLensApiError} from '../../../../../typings';
import {FieldKey, InnerFieldKey} from '../../../constants';
import type {FormDict} from '../../../typings';
import {getGSheetErrorData} from '../../../utils';
import {
    connectionDataSelector,
    connectionIdSelector,
    formSelector,
    googleRefreshTokenSelector,
    gsheetItemsSelector,
    initialFormSelector,
    innerAuthorizedSelector,
} from '../../selectors';
import type {
    ApplySourceSettings,
    ConnectionsReduxDispatch,
    GSheetItem,
    GSheetReadonlySource,
    GetState,
    UploadedGSheet,
} from '../../typings';
import {api} from '../api';
import {
    setForm,
    setGSheetItems,
    setGSheetSelectedItemId,
    setGsheetAddSectionState,
    setInitialForm,
    setInitialState,
    setInnerForm,
} from '../base';

import {pollGSheetSourceStatus, pollGSheetStatus, updateGSheetItem} from './misc-actions';
import {
    getGSheetItemIndex,
    getGSheetSourceItemTitle,
    mapGSheetItemsToAPIFormat,
    mapGSheetItemsToUpdateAPIFormat,
    shapeGSheetReadonlySourceItem,
    shapeUploadedGSheetItem,
} from './utils';

export {
    updateGSheetSource,
    updateGSheetItem,
    setGSheetItemsAndFormSources,
    gsheetToSourcesInfo,
} from './misc-actions';
export type {UpdateGSheetItemArgs} from './misc-actions';
export {
    getGSheetItemIndex,
    getFilteredGSheetItems,
    extractGSheetItemId,
    findUploadedGSheet,
    isGSheetSourceItem,
} from './utils';

const i18n = I18n.keyset('connections.gsheet.view');

// TODO: https://github.com/datalens-tech/datalens-ui/issues/375
export const showGsheetUploadingFailureToast = (error: DataLensApiError) => {
    return async (dispatch: ConnectionsReduxDispatch) => {
        const {title} = getGSheetErrorData({error, type: 'uploadedGSheet'});
        dispatch(showToast({error, title}));
    };
};

export const retryPollGSheetStatus = (fileId: string) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(updateGSheetItem({id: fileId, updates: {status: 'in_progress', error: null}}));
        pollGSheetStatus({fileId, dispatch, getState});
    };
};

export const addGoogleSheet = (url: string) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const connectionId = connectionIdSelector(getState());
        const refreshToken = googleRefreshTokenSelector(getState());
        const authorized = innerAuthorizedSelector(getState());
        dispatch(setGsheetAddSectionState({uploading: true}));
        const {gsheet, error} = await api.addGoogleSheet({
            url,
            authorized,
            connectionId,
            refreshToken,
        });

        batch(() => {
            if (error) {
                dispatch(showGsheetUploadingFailureToast(error));
            }

            dispatch(
                setGsheetAddSectionState({
                    uploading: false,
                    ...(!error && {url: '', active: false}),
                }),
            );

            if (gsheet) {
                const prevItems = get(getState().connections, ['gsheet', 'items']);
                const uploadedGSheet = shapeUploadedGSheetItem({data: gsheet});
                dispatch(setGSheetItems({items: [...prevItems, uploadedGSheet]}));
                dispatch(setGSheetSelectedItemId({selectedItemId: gsheet.file_id}));
                pollGSheetStatus({fileId: gsheet.file_id, dispatch, getState});
            }
        });
    };
};

export const applyGSheetSourceSettings: ApplySourceSettings = (fileId, sourceId, settings) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(
            updateGSheetItem({
                id: sourceId,
                updates: {status: 'in_progress', error: null, data: {data_settings: settings}},
            }),
        );
        const items = get(getState().connections, ['gsheet', 'items']);
        const itemIndex = getGSheetItemIndex(items, sourceId);
        const title = getGSheetSourceItemTitle(items[itemIndex]);

        const {error} = await api.applySourceSettings(fileId, sourceId, settings, title);

        if (error) {
            dispatch(
                updateGSheetItem({
                    id: sourceId,
                    updates: {status: 'failed', error},
                }),
            );

            return;
        }

        pollGSheetSourceStatus({fileId, sourceId, dispatch, getState});
    };
};

export const setGSheetFormData = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const newConnection = !getState().connections.entry?.entryId;
        const connectionData = connectionDataSelector(getState());
        let form: FormDict;
        let innerForm: FormDict;
        let sources: GSheetReadonlySource['data'][] | undefined;
        let items: GSheetItem[] | undefined;

        if (newConnection) {
            form = {
                [FieldKey.Type]: ConnectorType.GsheetsV2,
                [FieldKey.Sources]: [],
                [FieldKey.RefreshEnabled]: false,
                [FieldKey.RefreshToken]: undefined,
            };
            innerForm = {
                [InnerFieldKey.Authorized]: false,
            };
        } else {
            sources = connectionData[FieldKey.Sources] as GSheetReadonlySource['data'][];
            items = sources.map((data) => shapeGSheetReadonlySourceItem({data}));
            const sourcesInAPIFormat = mapGSheetItemsToAPIFormat(items);
            form = {
                [FieldKey.Sources]: sourcesInAPIFormat,
                [FieldKey.RefreshEnabled]: connectionData[FieldKey.RefreshEnabled],
                [FieldKey.RefreshToken]: undefined,
            };
            innerForm = {
                [InnerFieldKey.Authorized]: connectionData[InnerFieldKey.Authorized],
            };
        }

        batch(() => {
            if (newConnection) {
                dispatch(setInitialState());
            }

            dispatch(setForm({updates: form}));
            dispatch(setInitialForm({updates: form}));
            dispatch(setInnerForm({updates: innerForm}));

            if (items) {
                dispatch(setGSheetItems({items}));
            }

            if (sources) {
                // If sources with the status 'in_progress' have arrived from the start, then they need to be supplemented
                // Otherwise, they do not contain information about the shield from which these sources are taken
                // The absence of this information will break the flow by clicking the 'Update Fields' button
                sources.forEach(({file_id: fileId, id: sourceId, status}) => {
                    if (status === 'in_progress') {
                        pollGSheetSourceStatus({
                            fileId,
                            sourceId,
                            initialPolling: true,
                            dispatch,
                            getState,
                        });
                    }
                });
            }
        });
    };
};

export const handleGSheetBeforeReplaceSource = (
    data: UploadedGSheet['data'],
    replacedSourceId: string,
) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevItems = get(getState().connections, ['gsheet', 'items']);
        const items = [...prevItems];
        const fileId = data.file_id;
        const replacedSourceIndex = getGSheetItemIndex(prevItems, replacedSourceId);
        const uploadedGSheet = shapeUploadedGSheetItem({data, replacedSourceId});
        items.splice(replacedSourceIndex, 1, uploadedGSheet);

        batch(() => {
            dispatch(setGSheetItems({items}));
            dispatch(setGSheetSelectedItemId({selectedItemId: fileId}));
            pollGSheetStatus({fileId, dispatch, getState});
        });
    };
};

export const updateConnectionData = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const connection_id = connectionIdSelector(getState());
        const refresh_token = googleRefreshTokenSelector(getState());
        const items = gsheetItemsSelector(getState());
        const authorized = innerAuthorizedSelector(getState());
        const sources = mapGSheetItemsToUpdateAPIFormat(items);

        const {files, error} = await api.updateS3BasedConnectionData({
            type: 'gsheets',
            connection_id,
            refresh_token,
            sources,
            authorized,
        });

        if (error) {
            const form = formSelector(getState());
            const initialForm = initialFormSelector(getState());
            const refreshEnabled = form[FieldKey.RefreshEnabled] as boolean;
            const prevRefreshEnabled = initialForm[FieldKey.RefreshEnabled] as boolean;

            batch(() => {
                // If you have launched an update by clicking on the checkbox, it has fallen and you need to press the check mark back
                if (refreshEnabled && refreshEnabled !== prevRefreshEnabled) {
                    dispatch(setForm({updates: {[FieldKey.RefreshEnabled]: prevRefreshEnabled}}));
                }

                dispatch(
                    showToast({
                        error,
                        title: i18n('label_update-failure'),
                    }),
                );
            });

            return;
        }

        files.forEach(({file_id: fileId, sources: fileSources}) => {
            fileSources.forEach(({source_id: sourceId}) => {
                pollGSheetSourceStatus({fileId, sourceId, dispatch, getState});
            });
        });
    };
};

export const googleLogin = (code: string) => {
    return async (dispatch: ConnectionsReduxDispatch) => {
        const {refresh_token: refreshToken, error} = await api.getOAuthToken({
            code,
            conn_type: ConnectorType.GsheetsV2,
            scope: 'google',
        });

        if (error) {
            dispatch(
                showToast({
                    error,
                    title: i18n('label_google-oauth-page-failure'),
                }),
            );

            return;
        }

        batch(() => {
            dispatch(setForm({updates: {[FieldKey.RefreshToken]: refreshToken}}));
            dispatch(setInnerForm({updates: {[InnerFieldKey.Authorized]: true}}));
        });
    };
};

export const googleLogout = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const connectionData = connectionDataSelector(getState());
        const initialAuthorized = connectionData[InnerFieldKey.Authorized];
        // When logging out in an already created connection, we send null,
        // on this basis, the back will delete the previously saved token
        const nextRefreshToken = initialAuthorized ? null : undefined;

        batch(() => {
            dispatch(setForm({updates: {[FieldKey.RefreshToken]: nextRefreshToken}}));
            dispatch(setInnerForm({updates: {[InnerFieldKey.Authorized]: false}}));
            dispatch(updateConnectionData());
        });
    };
};
