import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signup';
import {selectPassword} from '../../../store/selectors/signup';

export const Password = () => {
    const dispatch = useDispatch();

    const password = useSelector(selectPassword);

    const handleUpdate = (value: string) => dispatch(updateFormValues({password: value}));

    return (
        <TextInput
            type="password"
            size="l"
            value={password}
            onUpdate={handleUpdate}
            autoComplete="new-password"
        />
    );
};
