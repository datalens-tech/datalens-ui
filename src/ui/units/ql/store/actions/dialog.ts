import {QLParamType} from '../../../../../shared';
import {
    DIALOG_QL_PARAMETER,
    DialogQLApplyData,
    OpenDialogQLParameterArgs,
} from '../../../../components/DialogQLParameter/DialogQLParameter';
import {DatalensGlobalState} from '../../../../index';
import {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import {QLAction} from '../typings/ql';

type DialogParameterArgs = {
    onApply: (data: DialogQLApplyData) => void;
    onCancel?: () => void;
    type: QLParamType;
    value: string;
};

export function openDialogQLParameter({value, type, onApply, onCancel}: DialogParameterArgs) {
    return function (dispatch: AppDispatch<QLAction>, _getState: () => DatalensGlobalState) {
        const dialogQLParameterArgs: OpenDialogQLParameterArgs = {
            id: DIALOG_QL_PARAMETER,
            props: {
                visible: true,
                value,
                type,
                onClose: () => {
                    dispatch(closeDialog());

                    if (onCancel) {
                        onCancel();
                    }
                },
                onApply: (data: DialogQLApplyData) => {
                    if (onApply) {
                        onApply(data);
                    }
                    dispatch(closeDialog());
                },
            },
        };

        dispatch(openDialog(dialogQLParameterArgs));
    };
}
