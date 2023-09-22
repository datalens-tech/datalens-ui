import {Dispatch} from 'redux';
import {AliasClickHandlerArgs} from 'ui/units/dash/containers/Dialogs/DialogRelations/types';

import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {
    DIALOG_RELATIONS,
    DialogRelationsProps,
} from '../../../containers/Dialogs/DialogRelations/DialogRelations';
import {
    DIALOG_ALIASES,
    DialogAliasesProps,
} from '../../../containers/Dialogs/DialogRelations/components/DialogAliases/DialogAliases';
import * as actionTypes from '../../constants/dashActionTypes';

export const openDialogRelations = ({widget, dashKitRef, onClose}: DialogRelationsProps) => {
    return function (dispatch: Dispatch) {
        const openDialogRelationsParams: DialogRelationsProps = {
            onClose: () => {
                onClose();
                dispatch(closeDialog());
            },
            onApply: () => {
                dispatch(closeDialog());
            },
            widget,
            dashKitRef,
        };

        dispatch(
            openDialog({
                id: DIALOG_RELATIONS,
                props: openDialogRelationsParams,
            }),
        );
    };
};

export const closeDialogRelations = () => {
    return function (dispatch: Dispatch) {
        dispatch(closeDialog());
    };
};

export const openDialogAliases = (props: AliasClickHandlerArgs) => {
    return function (dispatch: Dispatch) {
        const openDialogAliasesParams: DialogAliasesProps = {
            ...props,
            onClose: () => {
                dispatch(closeDialog());
            },
        };

        dispatch(
            openDialog({
                id: DIALOG_ALIASES,
                props: openDialogAliasesParams,
            }),
        );
    };
};

export type SetNewRelationsAction = {
    type: typeof actionTypes.SET_NEW_RELATIONS;
    payload: boolean;
};

export const setNewRelations = (data: SetNewRelationsAction['payload']) => ({
    type: actionTypes.SET_NEW_RELATIONS,
    payload: data,
});
