import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {PencilToLine} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {FieldWrapper} from '../../../../../../../../../../../../components/FieldWrapper/FieldWrapper';
import {openDialogEditQuery} from '../../../../../../../../../../store/actions/dialogs/dialog-edit-query';
import {selectSelectorDialog} from '../../../../../../../../../../store/selectors/dashTypedSelectors';
const i18n = I18n.keyset('dash.edit-query-dialog');
export const EditQueryControl: React.FC = () => {
    const {validation} = useSelector(selectSelectorDialog);
    const dispatch = useDispatch();

    const handleButtonClick = () => {
        dispatch(openDialogEditQuery());
    };
    return (
        <FormRow label={i18n('field_query')}>
            <FieldWrapper error={validation.connectionQueryContent}>
                <Button
                    view={validation.connectionQueryContent ? 'outlined-danger' : 'outlined'}
                    onClick={handleButtonClick}
                >
                    <Icon data={PencilToLine} />

                    {i18n('button_edit-query')}
                </Button>
            </FieldWrapper>
        </FormRow>
    );
};
