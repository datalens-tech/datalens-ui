import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Button, Dialog, Loader, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEqualWith from 'lodash/isEqualWith';
import type {DatasetField} from 'shared';
import {DATASET_FIELD_TYPES, DialogParameterQA, isDateField} from 'shared';

import DialogManager from '../DialogManager/DialogManager';
import {SelectOptionWithIcon} from '../SelectComponents';

import {DefaultValueSection} from './DefaultValueSection';
import {TemplateSection} from './TemplateSection';
import {createParameterField, getTypesList} from './helpers';
import {useParameterForm} from './useParameterForm';
import {useFetchParameterTooltipMarkdown} from './useParameterTooltipMarkdown';
import {useValidationErrors} from './useValidationErrors';

import './DialogParameter.scss';

export const DIALOG_PARAMETER = Symbol('DIALOG_PARAMETER');

export type OpenDialogParameterArgs = {
    id: typeof DIALOG_PARAMETER;
    props: DialogParameterProps;
};

export type DialogParameterProps = {
    onClose: () => void;
    onApply: (item: DatasetField) => void;
    type: 'create' | 'edit' | 'edit-default-value';
    field?: DatasetField;
    onReset?: (fieldId: string) => DatasetField | undefined;
    showTemplateWarn?: boolean;
    templateEnabled?: boolean;
};

const b = block('dialog-parameter');
const i18n = I18n.keyset('component.dialog-parameter');

const DialogParameter: React.FC<DialogParameterProps> = (props: DialogParameterProps) => {
    const {onApply, onClose, type, field, onReset, showTemplateWarn, templateEnabled} = props;
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const prevTypeRef = React.useRef<DATASET_FIELD_TYPES | undefined>();

    const {formState, resetFormState, updateFormState} = useParameterForm({
        name: field?.title || '',
        defaultValue: field?.default_value?.toString() || '',
        type: field?.data_type || DATASET_FIELD_TYPES.STRING,
        getOriginalField: onReset,
        fieldId: field?.guid || '',
        template_enabled: field?.template_enabled,
        value_constraint: field?.value_constraint,
    });
    const {validationErrors} = useValidationErrors({
        name: formState.name,
        type: formState.type,
        defaultValue: formState.defaultValue,
        isSubmitted,
    });
    const {tooltipText, isTooltipLoading} = useFetchParameterTooltipMarkdown();
    const isCreateDialog = type === 'create';
    const isEditDefaultValueDialog = type === 'edit-default-value';
    const title = isCreateDialog ? i18n('title_create-parameter') : i18n('title_edit-parameter');
    const applyButtonText = isCreateDialog ? i18n('button_create') : i18n('button_edit');
    const typeItems: SelectOption[] = getTypesList();

    const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

    const hasFormChanges = React.useCallback(() => {
        if (type === 'create') {
            return true;
        }

        if (type === 'edit-default-value') {
            const originalDefaultValue = field?.default_value?.toString() || '';
            const currentDefaultValue = formState.defaultValue;
            return originalDefaultValue !== currentDefaultValue;
        }

        const originalFormState = {
            name: field?.title || '',
            type: field?.data_type || DATASET_FIELD_TYPES.STRING,
            defaultValue: field?.default_value?.toString() || '',
            template_enabled: field?.template_enabled,
            value_constraint: field?.value_constraint,
        };

        return !isEqualWith(originalFormState, formState, (value1, value2, key) => {
            // For value_constraint field, falsy values are equivalent to {type: 'null'}
            if (key === 'value_constraint') {
                const normalizedValue1 = value1 || {type: 'null'};
                const normalizedValue2 = value2 || {type: 'null'};
                return isEqualWith(normalizedValue1, normalizedValue2);
            }

            return undefined;
        });
    }, [type, field, formState]);

    const isFormValid =
        Object.values(validationErrors).every((error) => !error) && hasFormChanges();

    const handleUpdateFormState = React.useCallback(
        (updates: Parameters<typeof updateFormState>[0]) => {
            updateFormState(updates);
        },
        [updateFormState],
    );

    const handleNameUpdate = React.useCallback(
        (value: string) => {
            updateFormState({name: value});
        },
        [updateFormState],
    );

    const handleTypeUpdate = React.useCallback(
        (value: string[]) => {
            const newType = value[0] as DATASET_FIELD_TYPES;
            const currentType = prevTypeRef.current;
            let newDefaultValue = formState.defaultValue;

            if (
                isDateField({data_type: newType}) &&
                currentType &&
                !isDateField({data_type: currentType})
            ) {
                newDefaultValue = '';
            } else if (
                newType === DATASET_FIELD_TYPES.BOOLEAN &&
                currentType !== DATASET_FIELD_TYPES.BOOLEAN
            ) {
                newDefaultValue = 'false';
            } else if (
                currentType === DATASET_FIELD_TYPES.BOOLEAN &&
                newType !== DATASET_FIELD_TYPES.BOOLEAN
            ) {
                newDefaultValue = '';
            } else if (
                currentType &&
                isDateField({data_type: currentType}) &&
                !isDateField({data_type: newType})
            ) {
                newDefaultValue = '';
            }

            updateFormState({
                type: newType,
                defaultValue: newDefaultValue,
            });
        },
        [formState.defaultValue, updateFormState],
    );

    const handleApply = () => {
        setIsSubmitted(true);

        if (!formState.name || !formState.defaultValue) {
            return;
        }

        onApply(createParameterField(formState, field));
    };

    React.useEffect(() => {
        prevTypeRef.current = formState.type;
    }, [formState.type]);

    return (
        <Dialog
            onClose={onClose}
            open={true}
            className={b()}
            qa={DialogParameterQA.Dialog}
            contentOverflow="visible"
        >
            <Dialog.Header caption={title} />
            <Dialog.Body className={b('container')}>
                {isTooltipLoading ? (
                    <Loader className={b('loader')} />
                ) : (
                    <>
                        <div className={b('line')}>
                            <span className={b('line-title')}>
                                <span>{i18n('parameter_name')}</span>
                                <HelpPopover
                                    size="s"
                                    content={tooltipText}
                                    className={b('title-tooltip')}
                                    placement="right"
                                />
                            </span>
                            <TextInput
                                disabled={isEditDefaultValueDialog}
                                value={formState.name}
                                type="text"
                                validationState={validationErrors.name ? 'invalid' : undefined}
                                errorPlacement="inside"
                                errorMessage={
                                    validationErrors.name ? (
                                        <React.Fragment>
                                            {validationErrors.name}
                                            <HelpPopover
                                                size="s"
                                                content={tooltipText}
                                                className={b('title-tooltip')}
                                            />
                                        </React.Fragment>
                                    ) : undefined
                                }
                                autoComplete={false}
                                qa={DialogParameterQA.NameInput}
                                pin="round-round"
                                size="m"
                                onUpdate={handleNameUpdate}
                            />
                        </div>
                        <div className={b('line')}>
                            <span className={b('line-title')}>{i18n('parameter_type')}</span>
                            <Select
                                disabled={isEditDefaultValueDialog}
                                width="max"
                                options={typeItems}
                                qa={DialogParameterQA.TypeSelector}
                                onUpdate={handleTypeUpdate}
                                value={[formState.type]}
                                renderSelectedOption={renderOptions}
                                renderOption={renderOptions}
                                popupClassName={b('dialog-popup')}
                            />
                        </div>
                        <DefaultValueSection
                            formState={formState}
                            updateFormState={handleUpdateFormState}
                            validationErrors={validationErrors}
                        />
                        {templateEnabled && !isEditDefaultValueDialog && (
                            <TemplateSection
                                formState={formState}
                                showTemplateWarn={showTemplateWarn}
                                updateFormState={handleUpdateFormState}
                            />
                        )}
                    </>
                )}
            </Dialog.Body>
            <Dialog.Footer
                preset="default"
                showError={false}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={applyButtonText}
                propsButtonCancel={{qa: DialogParameterQA.Cancel}}
                propsButtonApply={{disabled: !isFormValid, qa: DialogParameterQA.Apply}}
                onClickButtonApply={handleApply}
                onClickButtonCancel={onClose}
            >
                {isEditDefaultValueDialog && onReset && (
                    <Button
                        type="button"
                        size="l"
                        view="outlined"
                        onClick={resetFormState}
                        qa={DialogParameterQA.Reset}
                    >
                        {i18n('button_reset')}
                    </Button>
                )}
            </Dialog.Footer>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_PARAMETER, DialogParameter);
