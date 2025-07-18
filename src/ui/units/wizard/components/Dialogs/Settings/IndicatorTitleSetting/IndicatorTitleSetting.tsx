import React from 'react';

import {SegmentedRadioGroup as RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {ChartSettingsDialogQA, IndicatorTitleMode} from 'shared';

import './IndicatorTitleSetting.scss';

const RADIO_OPTIONS = [
    {
        value: IndicatorTitleMode.ByField,
        label: i18n('wizard', 'label_field-name'),
    },
    {
        value: IndicatorTitleMode.Manual,
        label: i18n('wizard', 'label_manual'),
    },
    {
        value: IndicatorTitleMode.Hide,
        label: i18n('wizard', 'label_hide'),
    },
];

type Props = {
    mode: IndicatorTitleMode;
    title: string;
    onUpdate: (settings: {mode: IndicatorTitleMode; title: string}) => void;
};

const b = block('indicator-title-setting');

const IndicatorTitleSetting: React.FC<Props> = (props: Props) => {
    const {mode, title, onUpdate} = props;

    const handleUpdateMode = (value: string) => {
        onUpdate({mode: value as IndicatorTitleMode, title});
    };

    const handleChangeInput = (value: string) => {
        onUpdate({mode, title: value});
    };

    return (
        <div className={b()}>
            <div className={b('row')}>
                <div className={b('title')}>{i18n('wizard', 'label_header')}</div>
                <RadioButton
                    value={mode}
                    onUpdate={handleUpdateMode}
                    qa={ChartSettingsDialogQA.IndicatorTitleMode}
                >
                    {RADIO_OPTIONS.map((item) => (
                        <RadioButton.Option key={item.value} value={item.value}>
                            {item.label}
                        </RadioButton.Option>
                    ))}
                </RadioButton>
            </div>
            {mode === IndicatorTitleMode.Manual && (
                <div className={b('row')}>
                    <div className={b('title')}>&nbsp;</div>
                    <TextInput
                        className={b('title-input')}
                        type="text"
                        qa="title-input"
                        pin="round-round"
                        size="s"
                        value={title}
                        onUpdate={handleChangeInput}
                    />
                </div>
            )}
        </div>
    );
};

export default IndicatorTitleSetting;
