import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {DashTabItemControlSourceType} from 'shared';
import {FieldWrapper} from 'ui/components/FieldWrapper/FieldWrapper';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

import Acceptable from './Acceptable/Acceptable';
import {MultiselectableCheckbox} from './MultiselectableCheckbox';
import {DynamicValueSelect} from './ValueSelector/DynamicValueSelect';
import {StaticValueSelect} from './ValueSelector/StaticValueSelect';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const ListValueControl = () => {
    const {sourceType, required, validation} = useSelector(selectSelectorDialog);

    return (
        <React.Fragment>
            <MultiselectableCheckbox />

            {sourceType === DashTabItemControlSourceType.Manual && (
                <React.Fragment>
                    <FormRow label={i18n('field_acceptable-values')}>
                        <Acceptable />
                    </FormRow>
                    <FormRow label={i18n('field_default-value')}>
                        <FieldWrapper error={validation.defaultValue}>
                            <StaticValueSelect
                                hasValidationError={Boolean(validation.defaultValue)}
                                hasClear={!required}
                            />
                        </FieldWrapper>
                    </FormRow>
                </React.Fragment>
            )}
            {sourceType !== DashTabItemControlSourceType.Manual && (
                <FormRow label={i18n('field_default-value')}>
                    <FieldWrapper error={validation.defaultValue}>
                        <DynamicValueSelect
                            hasValidationError={Boolean(validation.defaultValue)}
                            hasClear={!required}
                        />
                    </FieldWrapper>
                </FormRow>
            )}
        </React.Fragment>
    );
};
