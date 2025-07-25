import React from 'react';

import {Button, Checkbox, SegmentedRadioGroup as RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField, DatasetFieldCalcMode} from 'shared';
import {Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {I18n} from '../../../../i18n';
import {registry} from '../../../registry';
import {DUPLICATE_TITLE, EMPTY_TITLE} from '../constants';
import type {FieldEditorErrors, ModifyField} from '../typings';
import {getErrorMessageKey} from '../utils';

const b = block('dl-field-editor');
const i18n = I18n.keyset('component.dl-field-editor.view');

interface SettingsProps {
    modifyField: ModifyField;
    toggleDocumentationPanel: () => void;
    toggleAdditionalPanel: () => void;
    field: DatasetField;
    errors: FieldEditorErrors;
    onlyFormulaEditor?: boolean;
    additionalPanelVisible: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
    field: {calc_mode: calcMode, title, hidden},
    errors,
    onlyFormulaEditor,
    modifyField,
    toggleDocumentationPanel,
    toggleAdditionalPanel,
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const {AdditionalButtons} = registry.fieldEditor.components.getAll();

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onChangeTitle = (inputTitle: string) => {
        const errorMessageKey = getErrorMessageKey([DUPLICATE_TITLE, EMPTY_TITLE], errors);
        let errorUpdates;

        if (errorMessageKey) {
            errorUpdates = {
                [EMPTY_TITLE]: false,
                [DUPLICATE_TITLE]: false,
            };
        }

        modifyField({title: inputTitle}, errorUpdates);
    };

    const onCalcModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        modifyField({calc_mode: e.target.value as DatasetFieldCalcMode});
    };

    const inputTitle = title;

    const errorMessageKey = getErrorMessageKey([DUPLICATE_TITLE, EMPTY_TITLE], errors);
    const showDocButton = isEnabledFeature(Feature.FieldEditorDocSection) && calcMode === 'formula';

    return (
        <div className={b('settings')}>
            <div className={b('settings-field-name')}>
                <TextInput
                    controlRef={inputRef}
                    qa="field-name"
                    placeholder={i18n('label_field-name-placeholder')}
                    value={inputTitle}
                    error={errorMessageKey && i18n(errorMessageKey)}
                    onUpdate={onChangeTitle}
                />
            </div>
            {!onlyFormulaEditor && (
                <React.Fragment>
                    <RadioButton
                        className={b('settings-switcher')}
                        value={calcMode}
                        onChange={onCalcModeChange}
                    >
                        <RadioButton.Option content={i18n('value_formula')} value="formula" />
                        <RadioButton.Option
                            content={i18n('value_source-from-field')}
                            value="direct"
                        />
                    </RadioButton>
                    <Checkbox
                        className={b('settings-checkbox')}
                        content={i18n('label_hide-in-wizard')}
                        checked={hidden}
                        onChange={() => modifyField({hidden: !hidden})}
                    />
                </React.Fragment>
            )}
            <div className={b('settings-buttons-container')}>
                {showDocButton && (
                    <React.Fragment>
                        <AdditionalButtons toggleAdditionalPanel={toggleAdditionalPanel} />
                        <Button
                            className={b('settings-doc-btn')}
                            onClick={toggleDocumentationPanel}
                        >
                            {i18n('button_documentation')}
                        </Button>
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};
