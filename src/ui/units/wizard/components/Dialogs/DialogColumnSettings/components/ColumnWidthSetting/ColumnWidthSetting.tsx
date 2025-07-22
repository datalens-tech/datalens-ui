import React from 'react';

import type {SegmentedRadioGroupOptionProps} from '@gravity-ui/uikit';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ColumnSettings} from 'shared';

import {DialogRadioButtons} from '../../../components/DialogRadioButtons/DialogRadioButtons';

import './ColumnWidthSetting.scss';

type ColumnWidthSettingProps = {
    radioButtonQa?: string;
    inputQa?: string;
    settings: ColumnSettings['width'];
    onUpdate: (updateArgs: Partial<ColumnSettings['width']>) => void;
    onError: (error: boolean) => void;
};

const WIDTH_UNIT_RADIO_CONFIG: SegmentedRadioGroupOptionProps[] = [
    {
        content: i18n('wizard', 'label_auto'),
        value: 'auto',
    },
    {
        content: '%',
        value: 'percent',
    },
    {
        content: i18n('wizard', 'label_pixels-shortname'),
        value: 'pixel',
    },
];

const EMPTY_PLACEHOLDER = '—';

const b = block('column-width-setting');

export const ColumnWidthSetting: React.FC<ColumnWidthSettingProps> = (
    props: ColumnWidthSettingProps,
) => {
    const {settings, onUpdate, onError, radioButtonQa, inputQa} = props;

    const [error, setError] = React.useState<undefined | string>();

    React.useEffect(() => {
        if (error && settings.mode === 'auto') {
            setError(undefined);
        }
    }, [error, settings.mode]);

    return (
        <div className={b('container')}>
            <DialogRadioButtons
                qa={radioButtonQa}
                stretched={true}
                items={WIDTH_UNIT_RADIO_CONFIG}
                value={settings.mode}
                onUpdate={(mode: string) => {
                    onUpdate({mode: mode as ColumnSettings['width']['mode']});
                }}
            />
            <TextInput
                qa={inputQa}
                error={error}
                className={b('input')}
                disabled={settings.mode === 'auto'}
                value={settings.mode === 'auto' ? EMPTY_PLACEHOLDER : settings.value || ''}
                onUpdate={(value) => {
                    onUpdate({value});
                    if (isNaN(Number(value))) {
                        setError(i18n('wizard', 'label_enter-number'));
                        onError(true);
                        return;
                    }

                    setError(undefined);
                    onError(false);
                }}
            />
        </div>
    );
};
