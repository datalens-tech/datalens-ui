import React from 'react';

import {Eye, EyeSlash} from '@gravity-ui/icons';
import {
    ActionTooltip,
    Button,
    Dialog,
    Icon,
    SegmentedRadioGroup as RadioButton,
    TextInput,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField, DatasetFieldCalcMode} from 'shared';
import {Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {I18n} from '../../../../i18n';
import {registry} from '../../../registry';
import {DUPLICATE_TITLE, EMPTY_TITLE} from '../constants';
import type {FieldEditorErrors, ModifyField} from '../typings';
import {getErrorMessageKey} from '../utils';

import {NameHeader} from './NameHeader';

const b = block('dl-field-editor');
const i18n = I18n.keyset('component.dl-field-editor.view');

const MIN_NAME_INPUT_WIDTH = 300;
const NAME_INPUT_OFFSET = 44;

interface SettingsProps {
    modifyField: ModifyField;
    toggleDocumentationPanel: () => void;
    toggleAdditionalPanel: () => void;
    field: DatasetField;
    errors: FieldEditorErrors;
    onlyFormulaEditor?: boolean;
    additionalPanelVisible: boolean;
    isNewField: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
    field: {calc_mode: calcMode, title, hidden},
    errors,
    onlyFormulaEditor,
    modifyField,
    toggleDocumentationPanel,
    toggleAdditionalPanel,
    isNewField,
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const fakeInputTitleRef = React.useRef<HTMLSpanElement>(null);
    const [inputTitleWidth, setInputTitleWidth] = React.useState(MIN_NAME_INPUT_WIDTH);

    const {AdditionalButtonsWrapper} = registry.fieldEditor.components.getAll();

    const updateTitleInputWidth = React.useCallback((inputTitle = '') => {
        if (fakeInputTitleRef.current) {
            fakeInputTitleRef.current.textContent = inputTitle;
            setInputTitleWidth(
                Math.max(
                    fakeInputTitleRef.current.offsetWidth + NAME_INPUT_OFFSET,
                    MIN_NAME_INPUT_WIDTH,
                ),
            );
        }
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            updateTitleInputWidth(title);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeTitle = (inputTitle: string) => {
        updateTitleInputWidth(inputTitle);

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

    const [titleEditMode, setTitleEditMode] = React.useState(!title || Boolean(errorMessageKey));

    const handleStartEditTitle = React.useCallback(() => {
        setTitleEditMode(true);
        setTimeout(() => {
            inputRef.current?.focus();
        });
    }, []);

    const handleStopEditTitle = React.useCallback(() => {
        if (inputTitle && !errorMessageKey) {
            setTitleEditMode(false);
        }
    }, [inputTitle, errorMessageKey]);

    React.useEffect(() => {
        if (errorMessageKey) {
            setTitleEditMode(true);
        }
    }, [errorMessageKey]);

    return (
        <React.Fragment>
            <Dialog.Header
                caption={
                    titleEditMode ? (
                        <TextInput
                            className={b('settings-field-name')}
                            controlProps={{
                                className: b('settings-field-name-input'),
                            }}
                            style={{
                                width: inputTitleWidth,
                            }}
                            controlRef={inputRef}
                            qa="field-name"
                            placeholder={
                                isNewField
                                    ? i18n('label_field-name-placeholder-new')
                                    : i18n('label_field-name-placeholder')
                            }
                            value={inputTitle}
                            error={errorMessageKey && i18n(errorMessageKey)}
                            onUpdate={onChangeTitle}
                            size="l"
                            errorPlacement="inside"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleStopEditTitle();
                                }
                            }}
                            onBlur={handleStopEditTitle}
                            hasClear={true}
                        />
                    ) : (
                        <NameHeader title={inputTitle} onStartEdit={handleStartEditTitle} />
                    )
                }
            />
            <span
                ref={fakeInputTitleRef}
                className={b('settings-field-name-input', {fake: true})}
            />
            <div className={b('settings')}>
                {!onlyFormulaEditor && (
                    <RadioButton value={calcMode} onChange={onCalcModeChange}>
                        <RadioButton.Option content={i18n('value_formula')} value="formula" />
                        <RadioButton.Option
                            content={i18n('value_source-from-field')}
                            value="direct"
                        />
                    </RadioButton>
                )}
                <div className={b('settings-buttons-container')}>
                    {showDocButton && (
                        <AdditionalButtonsWrapper toggleAdditionalPanel={toggleAdditionalPanel} />
                    )}
                    {!onlyFormulaEditor && (
                        <ActionTooltip
                            title={
                                hidden ? i18n('label_hide-in-wizard') : i18n('label_show-in-wizard')
                            }
                        >
                            <Button
                                onClick={() => modifyField({hidden: !hidden})}
                                className={b('hide-in-wizard-button', {
                                    last: !showDocButton,
                                })}
                            >
                                <Icon data={hidden ? EyeSlash : Eye} />
                            </Button>
                        </ActionTooltip>
                    )}
                    {showDocButton && (
                        <Button onClick={toggleDocumentationPanel}>
                            {i18n('button_documentation')}
                        </Button>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};
