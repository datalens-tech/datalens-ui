import React from 'react';

import {I18n} from 'i18n';

import {SectionWrapper} from '../../../../../../../../components/SectionWrapper/SectionWrapper';
import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import type {ValueSelectorControlProps} from '../../ValueSelector/types';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {ParameterNameInput} from '../ParameterNameInput/ParameterNameInput';
import {getElementOptions} from '../helpers/input-type-select';

const i18n = I18n.keyset('dash.control-dialog.edit');

type InputSettingsProps = {
    isSectionHidden?: boolean;
};

const InputSettings = ({isSectionHidden}: InputSettingsProps) => {
    const options = React.useMemo(() => {
        return getElementOptions();
    }, []);

    const controlProps: ValueSelectorControlProps = React.useMemo(
        () => ({select: {type: 'manual'}}),
        [],
    );

    return (
        <React.Fragment>
            <SectionWrapper
                isStylesHidden={isSectionHidden}
                title={isSectionHidden ? '' : i18n('label_common-settings')}
            >
                <ParameterNameInput label={i18n('field_field-name')} />
                <InputTypeSelector options={options} />
                <OperationSelector />
                <ValueSelector controlProps={controlProps} />
            </SectionWrapper>
        </React.Fragment>
    );
};

export {InputSettings};
