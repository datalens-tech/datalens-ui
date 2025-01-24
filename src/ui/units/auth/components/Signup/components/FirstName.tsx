import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signup';
import {selectFirstName} from '../../../store/selectors/signup';

export const FirstName = () => {
    const dispatch = useDispatch();

    const firstName = useSelector(selectFirstName);

    const handleUpdate = (value: string) => dispatch(updateFormValues({firstName: value}));

    return <TextInput value={firstName} onUpdate={handleUpdate} size="l" />;
};
