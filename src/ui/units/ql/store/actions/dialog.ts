import type {QLParamType} from '../../../../../shared';
import type {
    DialogQLApplyData,
    OpenDialogQLParameterArgs,
} from '../../../../components/DialogQLParameter/DialogQLParameter';
import {DIALOG_QL_PARAMETER} from '../../../../components/DialogQLParameter/DialogQLParameter';
import type {DatalensGlobalState} from '../../../../index';
import type {AppDispatch} from '../../../../store';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import type {QLAction} from '../typings/ql';

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
