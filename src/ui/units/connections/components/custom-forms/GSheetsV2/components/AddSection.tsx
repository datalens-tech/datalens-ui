import React from 'react';

import type {TextInputProps} from '@gravity-ui/uikit';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {AddGoogleSheet, UpdateAddSectionState} from '../types';

import iconPlus from '../../../../../../assets/icons/plus.svg';

const b = block('conn-form-gsheets');
const i18n = I18n.keyset('connections.gsheet.view');

type AddSectionProps = {
    url: string;
    active: boolean;
    disabled: boolean;
    uploading: boolean;
    addGoogleSheet: AddGoogleSheet;
    updateAddSectionState: UpdateAddSectionState;
};

export const AddSection = (props: AddSectionProps) => {
    const {url, active, uploading, disabled, addGoogleSheet, updateAddSectionState} = props;
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleActivation = React.useCallback(() => {
        updateAddSectionState({active: true});
    }, [updateAddSectionState]);

    const handleDeactivation = React.useCallback(() => {
        updateAddSectionState({
            url: '',
            active: false,
        });
    }, [updateAddSectionState]);

    const handleInputUpdate = React.useCallback<NonNullable<TextInputProps['onUpdate']>>(
        (nextUrl) => {
            updateAddSectionState({url: nextUrl});
        },
        [updateAddSectionState],
    );

    const handleInputKeyDown = React.useCallback<NonNullable<TextInputProps['onKeyDown']>>(
        (e) => {
            if (e.key === 'Enter' && url) {
                addGoogleSheet(url);
            }

            if (e.key === 'Escape') {
                handleDeactivation();
            }
        },
        [url, addGoogleSheet, handleDeactivation],
    );

    const handleButtonAddClick = React.useCallback(() => {
        addGoogleSheet(url);
    }, [url, addGoogleSheet]);

    React.useEffect(() => {
        if (active) {
            inputRef.current?.focus();
        }
    }, [active]);

    return (
        <div className={b('add-section')}>
            {active ? (
                <div className={b('add-section-controls')}>
                    <TextInput
                        controlRef={inputRef}
                        className={b('add-section-controls-input')}
                        value={url}
                        placeholder={i18n('label_add-table-placeholder')}
                        hasClear={true}
                        disabled={uploading}
                        onUpdate={handleInputUpdate}
                        onKeyDown={handleInputKeyDown}
                    />
                    <Button onClick={handleDeactivation}>{i18n('button_cancel')}</Button>
                    <Button
                        view="action"
                        loading={uploading}
                        disabled={!url}
                        onClick={handleButtonAddClick}
                    >
                        {i18n('button_add')}
                    </Button>
                </div>
            ) : (
                <Button view="outlined" disabled={disabled} onClick={handleActivation}>
                    <Icon data={iconPlus} size={14} />
                    {i18n('button_add-table')}
                </Button>
            )}
        </div>
    );
};
