import React from 'react';

import {I18n} from 'i18n';

import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {RequiredValueCheckbox} from '../../ValueSelector/RequiredValueCheckbox/RequiredValueCheckbox';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {ParameterNameInput} from '../ParameterNameInput/ParameterNameInput';

const i18n = I18n.keyset('dash.control-dialog.edit');

const InputSettings = ({
    hideCommonFields,
    rowClassName,
}: {
    hideCommonFields?: boolean;
    rowClassName?: string;
}) => {
    return (
        <React.Fragment>
            <ParameterNameInput
                label={i18n('field_field-name')}
                note={i18n('field_field-name-note')}
                className={rowClassName}
            />
            {!hideCommonFields && (
                <React.Fragment>
                    <InputTypeSelector className={rowClassName} />
                    <OperationSelector className={rowClassName} />
                    <RequiredValueCheckbox className={rowClassName} />
                    <ValueSelector rowClassName={rowClassName} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export {InputSettings};
