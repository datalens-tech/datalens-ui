import React from 'react';

import {SegmentedRadioGroup as RadioButton, Select, type SelectOption} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {get} from 'lodash';
import {CSVDelimiter, CSVEncoding} from 'shared';

import type {FileSourceItem} from '../../../../../store';
import type {HandleSourceSettingsApply} from '../../types';

const b = block('conn-form-file');
const i18n = I18n.keyset('connections.file.view');
const HEADER = {
    OFF: 'off',
    ON: 'on',
};

type FileSettingsProps = {
    onUpdate: HandleSourceSettingsApply;
    item: FileSourceItem;
};
type DelimiterValue = [CSVDelimiter];
type EncodingValue = [CSVEncoding];

const shapeDelimiterOptions = (delimiters: CSVDelimiter[]): SelectOption[] => {
    return delimiters.map((delimiter) => {
        let content: string;

        switch (delimiter) {
            case CSVDelimiter.Comma:
                content = i18n('label_delimiter-comma');
                break;
            case CSVDelimiter.Semicolon:
                content = i18n('label_delimiter-semicolon');
                break;
            case CSVDelimiter.Tab:
                content = i18n('label_delimiter-tab');
                break;
            default:
                console.warn(`There is no translation for ${delimiter} delimiter`);
                content = delimiter;
        }

        return {value: delimiter, content};
    });
};

const shapeEncodingOptions = (encodings: CSVEncoding[]): SelectOption[] => {
    return encodings.map((encoding) => {
        let content: string;

        switch (encoding) {
            case CSVEncoding.Utf8:
                content = i18n('label_encoding-utf-8');
                break;
            case CSVEncoding.Utf8sig:
                content = i18n('label_encoding-utf-8-sig');
                break;
            case CSVEncoding.Windows1251:
                content = i18n('label_encoding-windows-1251');
                break;
            default:
                console.warn(`There is no translation for ${encoding} encoding`);
                content = encoding;
        }

        return {value: encoding, content};
    });
};

const convertBoolHeaderToString = (value: boolean) => {
    return value ? HEADER.ON : HEADER.OFF;
};

const convertStringHeaderToBool = (value: string) => {
    return value === HEADER.ON;
};

export const FileSettings = ({onUpdate, item}: FileSettingsProps) => {
    const availableDelimiters = get(item, ['options', 'data_settings', 'delimiter']);
    const availableEncodings = get(item, ['options', 'data_settings', 'encoding']);
    const {encoding, delimiter, first_line_is_header} = get(item, ['data_settings']);
    const header = convertBoolHeaderToString(first_line_is_header);
    const [encodingValue, setEncodingValue] = React.useState<EncodingValue>([encoding]);
    const [delimiterValue, setDelimiterValue] = React.useState<DelimiterValue>([delimiter]);
    const [selectedHeader, setSelectedHeader] = React.useState(header);

    const handleEncodingUpdate = React.useCallback(
        (values: string[]) => {
            const [selectedEncoding] = values as EncodingValue;
            setEncodingValue(values as EncodingValue);
            onUpdate(item.file_id, item.source.source_id, {
                ...item.data_settings,
                encoding: selectedEncoding,
            });
        },
        [onUpdate, item],
    );

    const handleDelimiterUpdate = React.useCallback(
        (values: string[]) => {
            const [selectedDelimiter] = values as DelimiterValue;
            setDelimiterValue(values as DelimiterValue);
            onUpdate(item.file_id, item.source.source_id, {
                ...item.data_settings,
                delimiter: selectedDelimiter,
            });
        },
        [onUpdate, item],
    );

    const handleHeaderUpdate = React.useCallback(
        (value: string) => {
            setSelectedHeader(value);
            onUpdate(item.file_id, item.source.source_id, {
                ...item.data_settings,
                first_line_is_header: convertStringHeaderToBool(value),
            });
        },
        [onUpdate, item],
    );

    React.useEffect(() => setEncodingValue([encoding]), [encoding]);

    React.useEffect(() => setDelimiterValue([delimiter]), [delimiter]);

    React.useEffect(() => {
        const nextHeader = convertBoolHeaderToString(first_line_is_header);
        setSelectedHeader(nextHeader);
    }, [first_line_is_header]);

    return (
        <div className={b('settings')}>
            {availableEncodings && (
                <React.Fragment>
                    <span className={b('settings-label')}>{i18n('label_encoding')}</span>
                    <Select
                        className={b('settings-select')}
                        width="max"
                        value={encodingValue}
                        options={shapeEncodingOptions(availableEncodings)}
                        onUpdate={handleEncodingUpdate}
                    />
                </React.Fragment>
            )}
            {availableDelimiters && (
                <React.Fragment>
                    <span className={b('settings-label')}>{i18n('label_delimiter')}</span>
                    <Select
                        className={b('settings-select')}
                        width="max"
                        value={delimiterValue}
                        options={shapeDelimiterOptions(availableDelimiters)}
                        onUpdate={handleDelimiterUpdate}
                    />
                </React.Fragment>
            )}
            <span className={b('settings-label')}>{i18n('label_columns-header')}</span>
            <RadioButton value={selectedHeader} onUpdate={handleHeaderUpdate}>
                <RadioButton.Option content={i18n('label_header-enabled')} value={HEADER.ON} />
                <RadioButton.Option content={i18n('label_header-disabled')} value={HEADER.OFF} />
            </RadioButton>
        </div>
    );
};
