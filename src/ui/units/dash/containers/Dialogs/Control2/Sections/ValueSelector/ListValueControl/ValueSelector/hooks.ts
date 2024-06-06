import React from 'react';

import {useDispatch} from 'react-redux';
import type {SetSelectorDialogItemArgs} from 'units/dash/store/actions/dashTyped';
import {setSelectorDialogItem as setSelectorDialogItemAction} from 'units/dash/store/actions/dashTyped';

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
