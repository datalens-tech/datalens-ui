import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Button, Dialog, Loader, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';
import {DATASET_FIELD_TYPES, DialogParameterQA} from 'shared';

import DialogManager from '../DialogManager/DialogManager';
import {SelectOptionWithIcon} from '../SelectComponents';

import {DefaultValueSection} from './DefaultValueSection';
import {TemplateSection} from './TemplateSection';
import {createParameterField, getTypesList} from './helpers';
import {useParameterForm} from './useParameterForm';
import {useFetchParameterTooltipMarkdown} from './useParameterTooltipMarkdown';

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
    const {formState, resetFormState, updateFormState, isFormValid, isNameValid} = useParameterForm(
        {
            name: field?.title || '',
            defaultValue: field?.default_value?.toString() || '',
            type: field?.data_type || DATASET_FIELD_TYPES.STRING,
            getOriginalField: onReset,
            fieldId: field?.guid || '',
            template_enabled: field?.template_enabled,
            value_constraint: field?.value_constraint,
        },
    );
    const {tooltipText, isTooltipLoading} = useFetchParameterTooltipMarkdown();
    const isCreateDialog = type === 'create';
    const isEditDefaultValueDialog = type === 'edit-default-value';
    const title = isCreateDialog ? i18n('title_create-parameter') : i18n('title_edit-parameter');
    const applyButtonText = isCreateDialog ? i18n('button_create') : i18n('button_edit');
    const typeItems: SelectOption[] = getTypesList();

    const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

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
                                validationState={isNameValid ? undefined : 'invalid'}
                                errorPlacement="inside"
                                errorMessage={
                                    <React.Fragment>
                                        {i18n('parameter_name-error')}
                                        <HelpPopover
                                            size="s"
                                            content={tooltipText}
                                            className={b('title-tooltip')}
                                        />
                                    </React.Fragment>
                                }
                                autoComplete={false}
                                qa={DialogParameterQA.NameInput}
                                pin="round-round"
                                size="m"
                                onUpdate={(value) => {
                                    updateFormState({name: value});
                                }}
                            />
                        </div>
                        <div className={b('line')}>
                            <span className={b('line-title')}>{i18n('parameter_type')}</span>
                            <Select
                                disabled={isEditDefaultValueDialog}
                                width="max"
                                options={typeItems}
                                qa={DialogParameterQA.TypeSelector}
                                onUpdate={(value) => {
                                    updateFormState({type: value[0] as DATASET_FIELD_TYPES});
                                }}
                                value={[formState.type]}
                                renderSelectedOption={renderOptions}
                                renderOption={renderOptions}
                                popupClassName={b('dialog-popup')}
                            />
                        </div>
                        <DefaultValueSection
                            formState={formState}
                            updateFormState={updateFormState}
                        />
                        {templateEnabled && !isEditDefaultValueDialog && (
                            <TemplateSection
                                formState={formState}
                                showTemplateWarn={showTemplateWarn}
                                updateFormState={updateFormState}
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
                onClickButtonApply={() => {
                    if (isFormValid) {
                        onApply(createParameterField(formState, field));
                    }
                }}
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
