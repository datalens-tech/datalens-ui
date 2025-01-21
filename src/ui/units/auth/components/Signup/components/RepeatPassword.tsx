import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signup';
import {selectRepeatPassword} from '../../../store/selectors/signup';

export const RepeatPassword = () => {
    const dispatch = useDispatch();

    const repeatPassword = useSelector(selectRepeatPassword);

    const handleUpdate = (value: string) => dispatch(updateFormValues({repeatPassword: value}));

    return (
        <TextInput
            type="password"
            size="l"
            value={repeatPassword}
            onUpdate={handleUpdate}
            autoComplete="new-password"
        />
    );
};
