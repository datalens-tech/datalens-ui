import {DialogAction, OPEN_DIALOG, CLOSE_DIALOG} from '../actions/dialog';

export interface DialogState {
    dialogs: {id: symbol; props: any}[];
}

const getInitialDialogState = (): DialogState => ({
    dialogs: [],
});

function dialog(state: DialogState = getInitialDialogState(), action: DialogAction): DialogState {
    switch (action.type) {
        case OPEN_DIALOG:
            return {
                ...state,
                dialogs: [...state.dialogs, {id: action.id, props: action.props}],
            };

        case CLOSE_DIALOG: {
            return {
                ...state,
                dialogs: state.dialogs.slice(0, -1),
            };
        }

        default:
            return state;
    }
}

export default dialog;
