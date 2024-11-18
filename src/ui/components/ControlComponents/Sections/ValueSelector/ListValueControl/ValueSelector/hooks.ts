import React from 'react';

import {useDispatch} from 'react-redux';
import {setSelectorDialogItem as setSelectorDialogItemAction} from 'ui/store/actions/controlDialog';
import type {SetSelectorDialogItemArgs} from 'ui/store/typings/controlDialog';

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
