import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {setSelectorDialogItem} from '../../../../../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../../../../../store/selectors/dashTypedSelectors';
// @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
const i18n = I18n.keyset('dash.edit-query-dialog');
export const EditLabelControl = () => {
    const dispatch = useDispatch();
    const {connectionQueryContent} = useSelector(selectSelectorDialog);

    const query = connectionQueryContent?.query ?? '';

    const handleQueryChange = React.useCallback((value: string) => {
        dispatch(setSelectorDialogItem({connectionQueryContent: {query: value}}));
    }, []);

    return (
        //@ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
        <FormRow label={i18n('field_label')}>
            <TextInput value={query} onUpdate={handleQueryChange} />
        </FormRow>
    );
};
