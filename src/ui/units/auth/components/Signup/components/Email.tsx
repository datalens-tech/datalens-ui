import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signup';
import {selectEmail} from '../../../store/selectors/signup';

export const Email = () => {
    const dispatch = useDispatch();

    const email = useSelector(selectEmail);

    const handleUpdate = (value: string) => dispatch(updateFormValues({email: value}));

    return <TextInput value={email} onUpdate={handleUpdate} size="l" />;
};
