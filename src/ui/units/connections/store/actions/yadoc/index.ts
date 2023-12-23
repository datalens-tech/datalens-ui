import get from 'lodash/get';
import {batch} from 'react-redux';

import {innerAuthorizedSelector, yadocsAddSectionStateSelector} from '../../selectors';
import type {ConnectionsReduxDispatch, GetState} from '../../typings';
import {api} from '../api';
import {setYadocsAddSectionState, setYadocsItems, setYadocsSelectedItemId} from '../base';
import {showGsheetUploadingFailureToast} from '../gsheet';

import {pollYadocStatus} from './misc-actions';
import {shapeUploadedYadocItem} from './utils';

export {yadocToSourcesInfo} from './misc-actions';
export {extractYadocItemId, findUploadedYadoc, getYadocItemIndex} from './utils';

export const addYandexDocument = () => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const authorized = innerAuthorizedSelector(getState());
        const {path, mode} = yadocsAddSectionStateSelector(getState());
        dispatch(setYadocsAddSectionState({uploading: true}));
        const {document, error} = await api.addYandexDocument({
            authorized,
            ...(mode === 'private' ? {privatePath: path} : {publicLink: path}),
        });

        batch(() => {
            if (error) {
                dispatch(showGsheetUploadingFailureToast(error));
            }

            dispatch(
                setYadocsAddSectionState({
                    uploading: false,
                    ...(!error && {url: '', active: false}),
                }),
            );

            if (document) {
                const prevItems = get(getState().connections, ['yadocs', 'items']);
                const uploadedYadoc = shapeUploadedYadocItem({data: document});
                dispatch(setYadocsItems({items: [...prevItems, uploadedYadoc]}));
                dispatch(setYadocsSelectedItemId({selectedItemId: document.file_id}));
                pollYadocStatus({fileId: document.file_id, dispatch, getState});
            }
        });
    };
};
