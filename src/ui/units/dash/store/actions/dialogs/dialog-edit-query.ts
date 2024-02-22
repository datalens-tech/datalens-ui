import type {AppDispatch} from '../../../../../store';
import {openDialog} from '../../../../../store/actions/dialog';
import {DIALOG_EDIT_QUERY} from '../../../containers/Dialogs/DialogEditQuery/DialogEditQuery';

export const openDialogEditQuery = () => {
    return (dispatch: AppDispatch) => {
        dispatch(openDialog({id: DIALOG_EDIT_QUERY}));
    };
};
