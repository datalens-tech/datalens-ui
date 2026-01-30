import {I18n} from 'i18n';
import get from 'lodash/get';
import {batch} from 'react-redux';
import {ConnectorType} from 'shared';
import {FieldKey, InnerFieldKey} from 'ui/units/connections/constants';

import {showToast} from '../../../../../store/actions/toaster';
import type {FormDict} from '../../../typings';
import {
    connectionDataSelector,
    connectionIdSelector,
    formOauthTokenSelector,
    formSelector,
    initialFormSelector,
    innerAuthorizedSelector,
    yadocsItemsSelector,
} from '../../selectors';
import type {
    ApplySourceSettings,
    ConnectionsReduxDispatch,
    GetState,
    UploadedYadoc,
    YadocItem,
    YadocReadonlySource,
} from '../../typings';
import {api} from '../api';
import {
    setForm,
    setInitialForm,
    setInitialState,
    setInnerForm,
    setYadocsItems,
    setYadocsSelectedItemId,
} from '../base';

import {pollYadocSourceStatus, pollYadocStatus, updateYadocItem} from './misc-actions';
import {
    getYadocItemIndex,
    getYadocSourceItemTitle,
    mapYadocItemsToAPIFormat,
    mapYadocItemsToUpdateAPIFormat,
    shapeUploadedYadocItem,
    shapeYadocReadonlySourceItem,
} from './utils';

export {
    setYadocItemsAndFormSources,
    yadocToSourcesInfo,
    updateYadocItem,
    updateYadocSource,
} from './misc-actions';
export type {UpdateYadocItemArgs} from './misc-actions';
export {
    extractYadocItemId,
    findUploadedYadoc,
    getFilteredYadocItems,
    getYadocItemIndex,
    isYadocSourceItem,
} from './utils';

const i18n = I18n.keyset('connections.gsheet.view');

/** Prepares uploaded Yandex document in case of adding new document */
export const handleUploadedYadocBeforePolling = (data: UploadedYadoc['data']) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevItems = get(getState().connections, ['yadocs', 'items']);
        const uploadedYadoc = shapeUploadedYadocItem({data});
        dispatch(setYadocsItems({items: [...prevItems, uploadedYadoc]}));
        dispatch(setYadocsSelectedItemId({selectedItemId: data.file_id}));
        pollYadocStatus({fileId: data.file_id, dispatch, getState});
    };
};

/** Prepares uploaded Yandex document in case of replacing an existing source */
export const handleReplacedSourceBeforePolling = (
    data: UploadedYadoc['data'],
    replacedSourceId: string,
) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevItems = get(getState().connections, ['yadocs', 'items']);
        const items = [...prevItems];
        const fileId = data.file_id;
        const replacedSourceIndex = getYadocItemIndex(prevItems, replacedSourceId);
        const uploadedGSheet = shapeUploadedYadocItem({data, replacedSourceId});
        items.splice(replacedSourceIndex, 1, uploadedGSheet);

        batch(() => {
            dispatch(setYadocsItems({items}));
            dispatch(setYadocsSelectedItemId({selectedItemId: fileId}));
            pollYadocStatus({fileId, dispatch, getState});
        });
    };
};

export const retryPollYadocStatus = (fileId: string) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(updateYadocItem({id: fileId, updates: {status: 'in_progress', error: null}}));
        pollYadocStatus({fileId, dispatch, getState});
    };
};

export const updateYadocConnectionData = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const connection_id = connectionIdSelector(getState());
        const oauth_token = formOauthTokenSelector(getState());
        const items = yadocsItemsSelector(getState());
        const authorized = innerAuthorizedSelector(getState());
        const sources = mapYadocItemsToUpdateAPIFormat(items);

        const {files, error} = await api.updateS3BasedConnectionData({
            type: 'yadocs',
            authorized,
            connection_id,
            oauth_token,
            sources,
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
                pollYadocSourceStatus({fileId, sourceId, dispatch, getState});
            });
        });
    };
};

export const oauthLogin = (oauthToken: string) => {
    return async (dispatch: ConnectionsReduxDispatch) => {
        batch(() => {
            dispatch(setForm({updates: {[FieldKey.OAuthToken]: oauthToken}}));
            dispatch(setInnerForm({updates: {[InnerFieldKey.Authorized]: true}}));
        });
    };
};

export const oauthLogout = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const connectionData = connectionDataSelector(getState());
        const initialAuthorized = connectionData[InnerFieldKey.Authorized];
        // When logging out in an already created connection, we send null,
        // on this basis, the back will delete the previously saved token
        const nextRefreshToken = initialAuthorized ? null : undefined;

        batch(() => {
            dispatch(setForm({updates: {[FieldKey.OAuthToken]: nextRefreshToken}}));
            dispatch(setInnerForm({updates: {[InnerFieldKey.Authorized]: false}}));
            dispatch(updateYadocConnectionData());
        });
    };
};

export const applyYadocSourceSettings: ApplySourceSettings = (fileId, sourceId, settings) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(
            updateYadocItem({
                id: sourceId,
                updates: {status: 'in_progress', error: null, data: {data_settings: settings}},
            }),
        );
        const items = get(getState().connections, ['yadocs', 'items']);
        const itemIndex = getYadocItemIndex(items, sourceId);
        const title = getYadocSourceItemTitle(items[itemIndex]);

        const {error} = await api.applySourceSettings(fileId, sourceId, settings, title);

        if (error) {
            dispatch(
                updateYadocItem({
                    id: sourceId,
                    updates: {status: 'failed', error},
                }),
            );

            return;
        }

        pollYadocSourceStatus({fileId, sourceId, dispatch, getState});
    };
};

export const setYadocsFormData = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const newConnection = !getState().connections.entry?.entryId;
        const connectionData = connectionDataSelector(getState());
        let form: FormDict;
        let innerForm: FormDict;
        let sources: YadocReadonlySource['data'][] | undefined;
        let items: YadocItem[] | undefined;

        if (newConnection) {
            form = {
                [FieldKey.Type]: ConnectorType.Yadocs,
                [FieldKey.Sources]: [],
                [FieldKey.RefreshEnabled]: false,
                [FieldKey.RefreshToken]: undefined,
            };
            innerForm = {
                [InnerFieldKey.Authorized]: false,
            };
        } else {
            sources = connectionData[FieldKey.Sources] as YadocReadonlySource['data'][];
            items = sources.map((data) => shapeYadocReadonlySourceItem({data}));
            const sourcesInAPIFormat = mapYadocItemsToAPIFormat(items);
            form = {
                [FieldKey.Sources]: sourcesInAPIFormat,
                [FieldKey.RefreshEnabled]: connectionData[FieldKey.RefreshEnabled],
                [FieldKey.RefreshToken]: undefined,
                [FieldKey.Description]: connectionData[FieldKey.Description],
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
                dispatch(setYadocsItems({items}));
            }

            if (sources) {
                // If sources with the status 'in_progress' have arrived from the start, then they need to be supplemented
                // Otherwise, they do not contain information about the sheet from which these sources are taken
                // The absence of this information will break the flow by clicking the 'Update Fields' button
                sources.forEach(({file_id: fileId, id: sourceId, status}) => {
                    if (status === 'in_progress') {
                        pollYadocSourceStatus({
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
