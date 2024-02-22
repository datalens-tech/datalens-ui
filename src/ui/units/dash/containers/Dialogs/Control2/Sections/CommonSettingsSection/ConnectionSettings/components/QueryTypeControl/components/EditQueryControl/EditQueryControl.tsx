import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {PencilToLine} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';

import {openDialogEditQuery} from '../../../../../../../../../../store/actions/dialogs/dialog-edit-query';

const i18nConnectionBasedControlFake = (str: string) => str;
export const EditQueryControl: React.FC = () => {
    const dispatch = useDispatch();

    const handleButtonClick = () => {
        dispatch(openDialogEditQuery());
    };
    return (
        <FormRow label={i18nConnectionBasedControlFake('field_query')}>
            <Button view="outlined" onClick={handleButtonClick}>
                <Icon data={PencilToLine} />
                {i18nConnectionBasedControlFake('button_edit-query')}
            </Button>
        </FormRow>
    );
};
