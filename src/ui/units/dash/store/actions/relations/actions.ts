import type {Dispatch} from 'redux';
import type {AliasClickHandlerArgs} from 'ui/units/dash/containers/Dialogs/DialogRelations/types';

import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import type {DialogRelationsProps} from '../../../containers/Dialogs/DialogRelations/DialogRelations';
import {DIALOG_RELATIONS} from '../../../containers/Dialogs/DialogRelations/DialogRelations';
import type {DialogAliasesProps} from '../../../containers/Dialogs/DialogRelations/components/DialogAliases/DialogAliases';
import {DIALOG_ALIASES} from '../../../containers/Dialogs/DialogRelations/components/DialogAliases/DialogAliases';

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
            onClose: (args) => {
                if (typeof props.onCloseCallback === 'function') {
                    props.onCloseCallback(args);
                }
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

export const SET_NEW_RELATIONS = Symbol('dash/SET_NEW_RELATIONS');
export type SetNewRelationsAction = {
    type: typeof SET_NEW_RELATIONS;
    payload: boolean;
};

export const setNewRelations = (data: SetNewRelationsAction['payload']) => ({
    type: SET_NEW_RELATIONS,
    payload: data,
});
