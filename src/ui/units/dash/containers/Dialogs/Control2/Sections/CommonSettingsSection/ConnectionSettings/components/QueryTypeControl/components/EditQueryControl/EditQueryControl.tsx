import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {PencilToLine} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';

import {openDialogEditQuery} from '../../../../../../../../../../store/actions/dialogs/dialog-edit-query';
// @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
const i18n = I18n.keyset('dash.edit-query-dialog');
export const EditQueryControl: React.FC = () => {
    const dispatch = useDispatch();

    const handleButtonClick = () => {
        dispatch(openDialogEditQuery());
    };
    return (
        // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
        <FormRow label={i18n('field_query')}>
            <Button view="outlined" onClick={handleButtonClick}>
                <Icon data={PencilToLine} />

                {
                    // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
                    i18n('button_edit-query')
                }
            </Button>
        </FormRow>
    );
};
