import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {FieldWrapper} from 'ui/components/FieldWrapper/FieldWrapper';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {Acceptable} from './Acceptable/Acceptable';
import {MultiselectableCheckbox} from './MultiselectableCheckbox';
import {DynamicValueSelect} from './ValueSelector/DynamicValueSelect';
import {StaticValueSelect} from './ValueSelector/StaticValueSelect';
import type {DynamicValueSelectorCustomProps} from './ValueSelector/types';

const i18n = I18n.keyset('dash.control-dialog.edit');

export type ListValueControlProps = {hasMultiselect?: boolean} & (
    | {
          type: 'dynamic';
          custom: DynamicValueSelectorCustomProps;
      }
    | {type: 'manual'}
);
export const ListValueControl: React.FC<ListValueControlProps> = (props: ListValueControlProps) => {
    const {required, validation} = useSelector(selectSelectorDialog);

    const hasMultiselectValue = props.hasMultiselect ?? true;

    return (
        <React.Fragment>
            {hasMultiselectValue && <MultiselectableCheckbox />}

            {props.type === 'manual' && (
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
            {props.type === 'dynamic' && (
                <FormRow label={i18n('field_default-value')}>
                    <FieldWrapper error={validation.defaultValue}>
                        <DynamicValueSelect
                            {...props.custom}
                            hasValidationError={Boolean(validation.defaultValue)}
                            hasClear={!required}
                        />
                    </FieldWrapper>
                </FormRow>
            )}
        </React.Fragment>
    );
};
