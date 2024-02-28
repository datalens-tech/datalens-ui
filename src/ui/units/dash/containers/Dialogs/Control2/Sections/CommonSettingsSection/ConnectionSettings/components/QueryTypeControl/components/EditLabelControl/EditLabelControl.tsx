import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {setSelectorDialogItem} from '../../../../../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../../../../../store/selectors/dashTypedSelectors';

const i18nConnectionBasedControlFake = (str: string) => str;
export const EditLabelControl = () => {
    const dispatch = useDispatch();
    const {connectionQueryContent} = useSelector(selectSelectorDialog);

    const query = connectionQueryContent?.query ?? '';

    const handleQueryChange = React.useCallback((value: string) => {
        dispatch(setSelectorDialogItem({connectionQueryContent: {query: value}}));
    }, []);

    return (
        <FormRow label={i18nConnectionBasedControlFake('field_label')}>
            <TextInput value={query} onUpdate={handleQueryChange} />
        </FormRow>
    );
};
