import type {ConfigItem} from '@gravity-ui/dashkit';
import type {DashDragOptions} from 'shared';
import type {DatalensGlobalState} from 'ui/index';
import type {ValuesType} from 'utility-types';

import type {DashDispatch} from '..';
import {DIALOG_TYPE} from '../../../../../constants/dialogs';
import {getBeforeOpenDialogItemAction} from '../helpers';

export const OPEN_DIALOG = Symbol('dash/OPEN_DIALOG');
export type OpenDialogAction = {
    type: typeof OPEN_DIALOG;
    payload: {
        openedDialog: ValuesType<typeof DIALOG_TYPE>;
        dragOperationProps?: DashDragOptions;
    };
};

export const openDialog = (
    dialogType: ValuesType<typeof DIALOG_TYPE>,
    dragOperationProps?: DashDragOptions,
): OpenDialogAction => ({
    type: OPEN_DIALOG,
    payload: {
        openedDialog: dialogType,
        dragOperationProps,
    },
});

export const OPEN_ITEM_DIALOG = Symbol('dash/OPEN_ITEM_DIALOG');
type OpenItemDialogActionPayload = Omit<ConfigItem, 'type'> & {
    type: ValuesType<typeof DIALOG_TYPE>;
};
export type OpenItemDialogAction = {
    type: typeof OPEN_ITEM_DIALOG;
    payload: OpenItemDialogActionPayload;
};

const isItemTypeDialogPayload = (data: any): data is OpenItemDialogActionPayload => {
    return (
        Boolean(data) &&
        Object.values(DIALOG_TYPE).includes(data.type as ValuesType<typeof DIALOG_TYPE>)
    );
};

export const openItemDialog = (data: ConfigItem) => {
    return (dispatch: DashDispatch) => {
        if (isItemTypeDialogPayload(data)) {
            dispatch({
                type: OPEN_ITEM_DIALOG,
                payload: data,
            });
        }
    };
};

export const openItemDialogAndSetData = (data: ConfigItem) => {
    return (dispatch: DashDispatch) => {
        const beforeOpenDialogItem = getBeforeOpenDialogItemAction();
        dispatch(beforeOpenDialogItem(data));
        dispatch(openItemDialog(data));
    };
};

export const CLOSE_DIALOG = Symbol('dash/CLOSE_DIALOG');
export type CloseDialogAction = {
    type: typeof CLOSE_DIALOG;
    payload: {openedDialog: null; openedItemId: null};
};

export const closeDialog = () => {
    return (dispatch: DashDispatch, getState: () => DatalensGlobalState) => {
        getState().dash.dragOperationProps?.commit();

        dispatch({
            type: CLOSE_DIALOG,
            payload: {openedDialog: null, openedItemId: null},
        });
    };
};
