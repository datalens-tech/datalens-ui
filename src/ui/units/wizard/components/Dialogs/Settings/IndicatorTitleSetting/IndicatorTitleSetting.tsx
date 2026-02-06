import React from 'react';

import {
    Flex,
    SegmentedRadioGroup as RadioButton,
    Text,
    TextInput,
    spacing,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {ChartSettingsDialogQA, IndicatorTitleMode} from 'shared';

import './IndicatorTitleSetting.scss';

const TITLE_MODE_OPTIONS = [
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

const FONT_SIZES = ['s', 'm', 'l', 'xl'];
const FONT_SIZE_LABELS = ['XS', 'S', 'M', 'L'];
const DEFAULT_FONT_SIZE = 'm';

type Props = {
    mode: IndicatorTitleMode;
    title: string;
    fontSize?: string;
    onUpdate: (settings: {mode: IndicatorTitleMode; title: string; fontSize?: string}) => void;
    isMarkup?: boolean;
};

const b = block('indicator-title-setting');

const IndicatorTitleSetting: React.FC<Props> = (props: Props) => {
    const {mode, title, fontSize = DEFAULT_FONT_SIZE, onUpdate, isMarkup} = props;

    const handleUpdateMode = (value: string) => {
        onUpdate({mode: value as IndicatorTitleMode, title, fontSize});
    };

    const handleChangeInput = (value: string) => {
        onUpdate({mode, title: value, fontSize});
    };

    const handleUpdateFontSize = (value: string) => {
        onUpdate({mode, title, fontSize: value});
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
                    {TITLE_MODE_OPTIONS.map((item) => (
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
            <div className={b('row')} data-qa={ChartSettingsDialogQA.IndicatorFontSize}>
                <div className={b('title', spacing({mb: isMarkup ? 5 : 0}))}>
                    {i18n('wizard', 'label_font-size')}
                </div>
                <Flex direction="column" alignItems="flex-start">
                    <RadioButton
                        value={fontSize}
                        onUpdate={handleUpdateFontSize}
                        disabled={isMarkup}
                    >
                        {FONT_SIZES.map((size, index) => (
                            <RadioButton.Option key={size} value={size}>
                                {FONT_SIZE_LABELS[index]}
                            </RadioButton.Option>
                        ))}
                    </RadioButton>
                    {isMarkup && (
                        <Text color="secondary" className={spacing({mt: 1})}>
                            {i18n('wizard', 'label_font-size-disabled-hint')}
                        </Text>
                    )}
                </Flex>
            </div>
        </div>
    );
};

export default IndicatorTitleSetting;
