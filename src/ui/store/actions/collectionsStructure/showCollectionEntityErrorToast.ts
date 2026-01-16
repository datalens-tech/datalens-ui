import type {AppDispatch} from 'store';
import {showToast} from 'store/actions/toaster';
import {ErrorCode} from 'shared/constants';
import {I18n} from 'i18n';

const i18n = I18n.keyset('component.collections-structure');

export const showCollectionEntityErrorToast = (error: Error) => (dispatch: AppDispatch) => {
    let title = error.message;

    if ('code' in error) {
        switch (error.code) {
            case ErrorCode.CollectionAlreadyExists:
                title = i18n('toast_collection-already-exists-error');
                break;
            case ErrorCode.WorkbookAlreadyExists:
            case ErrorCode.MetaManagerWorkbookAlreadyExists:
                title = i18n('label_workbook-already-exists-error');
                break;
            default:
                title = error.message;
        }
    }

    return dispatch(
        showToast({
            title,
            error,
        }),
    );
};
