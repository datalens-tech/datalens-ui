import get from 'lodash/get';
import {batch} from 'react-redux';
import {FieldKey, InnerFieldKey} from 'ui/units/connections/constants';

import {connectionDataSelector} from '../../selectors';
import type {ConnectionsReduxDispatch, GetState, UploadedYadoc} from '../../typings';
import {setForm, setInnerForm, setYadocsItems, setYadocsSelectedItemId} from '../base';

import {pollYadocStatus, updateYadocItem} from './misc-actions';
import {getYadocItemIndex, shapeUploadedYadocItem} from './utils';

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
} from './utils';

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
        });
    };
};
