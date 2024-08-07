import React from 'react';

import {I18n} from 'i18n';

import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {RequiredValueCheckbox} from '../../ValueSelector/RequiredValueCheckbox/RequiredValueCheckbox';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {ParameterNameInput} from '../ParameterNameInput/ParameterNameInput';

const i18n = I18n.keyset('dash.control-dialog.edit');

const InputSettings = ({hideCommonFields}: {hideCommonFields?: boolean}) => {
    return (
        <React.Fragment>
            <ParameterNameInput
                label={i18n('field_field-name')}
                note={i18n('field_field-name-note')}
            />
            {!hideCommonFields && (
                <React.Fragment>
                    <InputTypeSelector />
                    <OperationSelector />
                    <RequiredValueCheckbox />
                    <ValueSelector />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export {InputSettings};
