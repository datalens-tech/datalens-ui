import type {Dispatch} from 'redux';
import type {AliasClickHandlerArgs} from 'ui/components/DialogRelations/types';
import type {DatalensGlobalState} from 'ui/index';

import type {DialogRelationsProps} from '../../../../../components/DialogRelations/DialogRelations';
import {DIALOG_RELATIONS} from '../../../../../components/DialogRelations/DialogRelations';
import type {DialogAliasesProps} from '../../../../../components/DialogRelations/components/DialogAliases/DialogAliases';
import {DIALOG_ALIASES} from '../../../../../components/DialogRelations/components/DialogAliases/DialogAliases';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {
    selectCurrentTabAliases,
    selectCurrentTabRelationDataItems,
    selectDashWorkbookId,
    selectWidgetsCurrentTab,
} from '../../selectors/dashTypedSelectors';
import {updateCurrentTabData} from '../dashTyped';

type OpenDialogRelationsProps = Omit<
    DialogRelationsProps,
    'dashTabAliases' | 'workbookId' | 'allWidgets' | 'onApply' | 'widgetsCurrentTab'
> & {
    onApply?: () => void;
};

export const openDialogRelations = ({
    widget,
    dashKitRef,
    onApply,
    onClose,
}: OpenDialogRelationsProps) => {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const state = getState();
        const dashTabAliases = selectCurrentTabAliases(state);
        const workbookId = selectDashWorkbookId(state);
        const allWidgets = selectCurrentTabRelationDataItems(state);
        const widgetsCurrentTab = selectWidgetsCurrentTab(state);

        const openDialogRelationsParams: DialogRelationsProps = {
            onClose: () => {
                onClose();
                dispatch(closeDialog());
            },
            onApply: (newData) => {
                onApply?.();
                dispatch(updateCurrentTabData(newData));
                onClose();
                dispatch(closeDialog());
            },
            widget,
            dashKitRef,
            dashTabAliases,
            widgetsCurrentTab,
            workbookId,
            allWidgets,
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
