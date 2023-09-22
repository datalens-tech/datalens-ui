import React from 'react';

import {useDispatch} from 'react-redux';
import {
    SetSelectorDialogItemArgs,
    setSelectorDialogItem as setSelectorDialogItemAction,
} from 'units/dash/store/actions/dashTyped';

export const useSetSelectorDialogItem = () => {
    const dispatch = useDispatch();

    const setSelectorDialogItem = React.useCallback(
        (args: SetSelectorDialogItemArgs) => {
            dispatch(setSelectorDialogItemAction(args));
        },
        [dispatch],
    );

    return {setSelectorDialogItem};
};
