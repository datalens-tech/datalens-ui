import React from 'react';

import {Plus, Xmark} from '@gravity-ui/icons';
import {Button, Icon, PasswordInput, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {KeyValueItem} from 'shared/schema/types';

import {useKeyValueProps, useKeyValueState} from './hooks';
import type {KeyValueEntry, KeyValueProps} from './types';

import './KeyValue.scss';

const b = block('conn-form-key-value');
const i18n = I18n.keyset('connections.form');
const ICON_SIZE = 18;

type KeyValueEntryViewProps = Omit<KeyValueItem, 'id' | 'name'> & {
    index: number;
    entry: KeyValueEntry;
    onDelete: (index: number) => void;
    onUpdate: (index: number, updates: Partial<KeyValueEntry>) => void;
};

const KeyValueEntryView = (props: KeyValueEntryViewProps) => {
    const {index, keys, entry, keySelectProps, valueInputProps, secret, onDelete, onUpdate} = props;
    let placeholder = valueInputProps?.placeholder;

    if (entry.initial && secret && !placeholder) {
        placeholder = i18n('label_secret-value');
    }

    if (entry.value === null) {
        return null;
    }

    return (
        <div className={b('entry')}>
            <Select
                {...keySelectProps}
                className={b('key-select')}
                options={keys}
                value={[entry.key]}
                onUpdate={(value) => {
                    onUpdate(index, {key: value[0]});
                }}
                validationState={entry.error ? 'invalid' : undefined}
                errorMessage={i18n('label_error-duplicated-keys')}
            />
            {secret ? (
                <PasswordInput
                    {...valueInputProps}
                    className={b('value-input')}
                    value={entry.value}
                    hideCopyButton={true}
                    placeholder={placeholder}
                    onUpdate={(value) => {
                        onUpdate(index, {value});
                    }}
                />
            ) : (
                <TextInput
                    {...valueInputProps}
                    className={b('value-input')}
                    value={entry.value}
                    onUpdate={(value) => {
                        onUpdate(index, {value});
                    }}
                />
            )}
            <Button view="flat" onClick={() => onDelete(index)}>
                <Icon data={Xmark} size={ICON_SIZE} />
            </Button>
        </div>
    );
};

export const KeyValue = (props: KeyValueProps) => {
    const {hasRequiredError, value, keys, keySelectProps, valueInputProps, secret, updateForm} =
        useKeyValueProps(props);
    const {keyValues, handleAddKeyValue, handleUpdateKeyValue, handleDeleteKeyValue} =
        useKeyValueState({
            value,
            updateForm,
        });

    return (
        <div className={b()}>
            {keyValues.map((item, index) => {
                return (
                    <KeyValueEntryView
                        key={`${item.key}-${index}`}
                        index={index}
                        keys={keys}
                        keySelectProps={keySelectProps}
                        valueInputProps={valueInputProps}
                        entry={item}
                        secret={secret}
                        onDelete={handleDeleteKeyValue}
                        onUpdate={handleUpdateKeyValue}
                    />
                );
            })}
            <div className={b('add-button-wrapper')}>
                <Button
                    className={b('add-button')}
                    onClick={handleAddKeyValue}
                    view={hasRequiredError ? 'outlined-danger' : 'normal'}
                >
                    <Icon data={Plus} size={ICON_SIZE} />
                    {i18n('button_add')}
                </Button>
                {hasRequiredError && (
                    <span className={b('add-button-error-message')}>
                        {i18n('label_error-empty-field')}
                    </span>
                )}
            </div>
        </div>
    );
};
