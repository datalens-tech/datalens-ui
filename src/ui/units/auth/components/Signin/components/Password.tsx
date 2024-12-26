import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signin';
import {selectPassword} from '../../../store/selectors/signin';

export const Password = () => {
    const dispatch = useDispatch();

    const password = useSelector(selectPassword);

    const handleUpdate = (value: string) => dispatch(updateFormValues({password: value}));

    return (
        <TextInput
            type="password"
            placeholder="Password"
            size="l"
            autoComplete="current-password"
            value={password}
            onUpdate={handleUpdate}
        />
    );
};
