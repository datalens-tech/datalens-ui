import React from 'react';

import type {SelectProps, SwitchProps, TextAreaProps} from '@gravity-ui/uikit';
import {Select, Switch, TextArea} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField, DatasetValueConstraintType} from 'shared';
import {DATASET_FIELD_TYPES, DATASET_VALUE_CONSTRAINT_TYPE} from 'shared';
import {usePrevious} from 'ui/hooks';

import type {UseParameterFormReturnValue} from './useParameterForm';

const b = block('dialog-parameter');
const i18n = I18n.keyset('component.dialog-parameter');
const VALUE_CONSTRAINT_TYPES_AVAILABLE_FOR_EDIT: string[] = [
    DATASET_VALUE_CONSTRAINT_TYPE.DEFAULT,
    DATASET_VALUE_CONSTRAINT_TYPE.REGEX,
];

interface TemplateSectionProps {
    formState: UseParameterFormReturnValue['formState'];
    updateFormState: UseParameterFormReturnValue['updateFormState'];
    showTemplateWarn?: boolean;
}

function shouldShowValueConstraintSection(type?: DatasetValueConstraintType) {
    return type && VALUE_CONSTRAINT_TYPES_AVAILABLE_FOR_EDIT.includes(type);
}

export function TemplateSection(props: TemplateSectionProps) {
    const {formState, showTemplateWarn, updateFormState} = props;
    const memoizedValueConstraintRef = React.useRef<DatasetField['value_constraint']>(
        formState.value_constraint,
    );
    const type = formState.type;
    const prevType = usePrevious(type);

    const getNextValueConstraint = (valueConstraintEnabled: boolean) => {
        let nextValueConstraint: DatasetField['value_constraint'];

        if (valueConstraintEnabled) {
            nextValueConstraint = memoizedValueConstraintRef.current || {
                type: DATASET_VALUE_CONSTRAINT_TYPE.DEFAULT,
            };
        } else {
            nextValueConstraint = {type: DATASET_VALUE_CONSTRAINT_TYPE.NULL};
        }

        return nextValueConstraint;
    };

    const handleSwitchTemplateUpdate: SwitchProps['onUpdate'] = (value) => {
        const valueConstraintEnabled = value && type === DATASET_FIELD_TYPES.STRING;
        updateFormState({
            template_enabled: value,
            value_constraint: getNextValueConstraint(valueConstraintEnabled),
        });
    };

    const handleSelectValidationTypeUpdate: SelectProps['onUpdate'] = (value) => {
        const valueConstraintType = value[0] as DatasetValueConstraintType;
        const pattern =
            memoizedValueConstraintRef.current?.type === DATASET_VALUE_CONSTRAINT_TYPE.REGEX &&
            memoizedValueConstraintRef.current.pattern;
        const nextValueConstraint: DatasetField['value_constraint'] = {
            ...(valueConstraintType === DATASET_VALUE_CONSTRAINT_TYPE.DEFAULT
                ? {type: valueConstraintType}
                : {type: valueConstraintType, pattern: pattern || ''}),
        };
        memoizedValueConstraintRef.current = nextValueConstraint;
        updateFormState({value_constraint: nextValueConstraint});
    };

    const handleTextAreaRegexUpdate: TextAreaProps['onUpdate'] = (value) => {
        const nextValueConstraint: DatasetField['value_constraint'] = {
            type: DATASET_VALUE_CONSTRAINT_TYPE.REGEX,
            pattern: value,
        };
        memoizedValueConstraintRef.current = nextValueConstraint;
        updateFormState({value_constraint: nextValueConstraint});
    };

    if (prevType && type && prevType !== type) {
        updateFormState({
            value_constraint: getNextValueConstraint(type === DATASET_FIELD_TYPES.STRING),
        });
    }

    return (
        <React.Fragment>
            <div className={b('line')}>
                <span className={b('line-title', {'vertical-align-start': true})}>
                    {i18n('label_switch-template')}
                </span>
                <div className={b('line-content')}>
                    <Switch
                        checked={Boolean(formState.template_enabled)}
                        className={b('switch-template')}
                        onUpdate={handleSwitchTemplateUpdate}
                    />
                    {showTemplateWarn && !formState.template_enabled && (
                        <span className={b('template-warning')}>
                            {i18n('label_switch-template-warn')}
                        </span>
                    )}
                </div>
            </div>
            {formState.type === DATASET_FIELD_TYPES.STRING &&
                formState.value_constraint &&
                shouldShowValueConstraintSection(formState.value_constraint?.type) && (
                    <div className={b('line')}>
                        <span className={b('line-title', {'vertical-align-start': true})}>
                            {i18n('label_select-validation-type')}
                        </span>
                        <div className={b('line-content')}>
                            <Select
                                width="max"
                                value={[formState.value_constraint.type]}
                                onUpdate={handleSelectValidationTypeUpdate}
                                popupClassName={b('dialog-popup')}
                            >
                                <Select.Option value={DATASET_VALUE_CONSTRAINT_TYPE.DEFAULT}>
                                    {i18n('label_select-validation-type-default')}
                                </Select.Option>
                                <Select.Option value={DATASET_VALUE_CONSTRAINT_TYPE.REGEX}>
                                    {i18n('label_select-validation-type-regex')}
                                </Select.Option>
                            </Select>
                            {formState.value_constraint.type ===
                                DATASET_VALUE_CONSTRAINT_TYPE.REGEX && (
                                <TextArea
                                    className={b('textarea-regex')}
                                    rows={4}
                                    value={formState.value_constraint.pattern}
                                    onUpdate={handleTextAreaRegexUpdate}
                                    placeholder={i18n('label_textarea-regex-placeholder')}
                                />
                            )}
                            {formState.value_constraint?.type ===
                                DATASET_VALUE_CONSTRAINT_TYPE.DEFAULT && (
                                <span className={b('validation-hint')}>
                                    {i18n('label_select-validation-type-default-hint')}
                                </span>
                            )}
                        </div>
                    </div>
                )}
        </React.Fragment>
    );
}
