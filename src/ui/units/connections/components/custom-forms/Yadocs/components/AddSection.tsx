import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Plus} from '@gravity-ui/icons';
import {Button, Icon, RadioButton, TextInput} from '@gravity-ui/uikit';
import type {TextInputProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {YadocsAddSectionState} from '../../../../store';
import {i18n8857} from '../constants';
import {AddYandexDoc, UpdateAddSectionState} from '../types';

const b = block('conn-form-yadocs');
const FILE_MODE: Record<string, YadocsAddSectionState['mode']> = {
    PUBLIC: 'public',
    PRIVATE: 'private',
};

type AddSectionProps = YadocsAddSectionState & {
    addYandexDoc: AddYandexDoc;
    updateAddSectionState: UpdateAddSectionState;
};

export const AddSection = (props: AddSectionProps) => {
    const {url, mode, active, uploading, disabled, addYandexDoc, updateAddSectionState} = props;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const inputPlaceholder =
        mode === 'private'
            ? i18n8857['label_add-input-private-placeholder']
            : i18n8857['label_add-input-public-placeholder'];
    const inputHelp =
        mode === 'private'
            ? i18n8857['label_add-input-private-help']
            : i18n8857['label_add-input-public-help'];

    const handleActivation = React.useCallback(() => {
        updateAddSectionState({active: true});
    }, [updateAddSectionState]);

    const handleDeactivation = React.useCallback(() => {
        updateAddSectionState({
            url: '',
            active: false,
        });
    }, [updateAddSectionState]);

    const handleModeUpdate = React.useCallback(
        (nextMode: string) => {
            updateAddSectionState({mode: nextMode as YadocsAddSectionState['mode']});
        },
        [updateAddSectionState],
    );

    const handleInputUpdate = React.useCallback<NonNullable<TextInputProps['onUpdate']>>(
        (nextUrl) => {
            updateAddSectionState({url: nextUrl});
        },
        [updateAddSectionState],
    );

    const handleInputKeyDown = React.useCallback<NonNullable<TextInputProps['onKeyDown']>>(
        (e) => {
            if (e.key === 'Enter' && url) {
                addYandexDoc(url);
            }

            if (e.key === 'Escape') {
                handleDeactivation();
            }
        },
        [url, addYandexDoc, handleDeactivation],
    );

    const handleButtonAddClick = React.useCallback(() => {
        addYandexDoc(url);
    }, [url, addYandexDoc]);

    React.useEffect(() => {
        if (active) {
            inputRef.current?.focus();
        }
    }, [active]);

    return (
        <div className={b('add-section')}>
            {active ? (
                <div className={b('add-section-controls')}>
                    <RadioButton
                        className={b('add-section-controls-area-a')}
                        value={mode}
                        onUpdate={handleModeUpdate}
                    >
                        <RadioButton.Option value={FILE_MODE.PUBLIC}>
                            {i18n8857['label_radio-value-public']}
                        </RadioButton.Option>
                        <RadioButton.Option value={FILE_MODE.PRIVATE}>
                            {i18n8857['label_radio-value-private']}
                        </RadioButton.Option>
                    </RadioButton>
                    <div className={b('add-section-controls-area-b')}>
                        <TextInput
                            controlRef={inputRef}
                            className={b('add-section-controls-area-b-input')}
                            value={url}
                            placeholder={inputPlaceholder}
                            hasClear={true}
                            disabled={uploading}
                            onUpdate={handleInputUpdate}
                            onKeyDown={handleInputKeyDown}
                        />
                        <HelpPopover content={inputHelp} />
                    </div>
                    <Button onClick={handleDeactivation}>{i18n8857.button_cancel}</Button>
                    <Button
                        view="action"
                        loading={uploading}
                        disabled={!url}
                        onClick={handleButtonAddClick}
                    >
                        {i18n8857.button_add}
                    </Button>
                </div>
            ) : (
                <Button view="outlined" disabled={disabled} onClick={handleActivation}>
                    <Icon data={Plus} size={14} />
                    {i18n8857['button_add-document']}
                </Button>
            )}
        </div>
    );
};
