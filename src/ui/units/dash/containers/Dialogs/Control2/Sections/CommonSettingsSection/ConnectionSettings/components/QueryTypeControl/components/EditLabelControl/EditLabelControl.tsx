import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {FieldWrapper} from '../../../../../../../../../../../../components/FieldWrapper/FieldWrapper';
import {setSelectorDialogItem} from '../../../../../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../../../../../store/selectors/dashTypedSelectors';
const i18n = I18n.keyset('dash.control-dialog.edit');
export const EditLabelControl = () => {
    const dispatch = useDispatch();
    const {connectionQueryContent, validation} = useSelector(selectSelectorDialog);

    const [query, setQuery] = React.useState(connectionQueryContent?.query ?? '');

    const handleQueryChange = React.useCallback((value: string) => {
        setQuery(value);
    }, []);

    const handleQueryInputBlur = () => {
        dispatch(setSelectorDialogItem({connectionQueryContent: {query: query}}));
    };

    return (
        <FormRow label={i18n('field_label')}>
            <FieldWrapper error={validation.connectionQueryContent}>
                <TextInput
                    value={query}
                    onUpdate={handleQueryChange}
                    onBlur={handleQueryInputBlur}
                />
            </FieldWrapper>
        </FormRow>
    );
};
