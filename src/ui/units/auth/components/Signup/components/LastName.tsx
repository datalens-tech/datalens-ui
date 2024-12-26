import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signup';
import {selectLastName} from '../../../store/selectors/signup';

export const LastName = () => {
    const dispatch = useDispatch();

    const lastName = useSelector(selectLastName);

    const handleUpdate = (value: string) => dispatch(updateFormValues({lastName: value}));

    return <TextInput value={lastName} onUpdate={handleUpdate} size="l" />;
};
