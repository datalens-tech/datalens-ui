import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {SegmentedRadioGroup as RadioButton, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {NavigatorPeriod, Period} from 'shared';
import {DATASET_FIELD_TYPES, NavigatorLinesMode} from 'shared';

import './NavigatorSubSettings.scss';

type NavigatorRadioButtonsProps = {
    linesMode: NavigatorLinesMode;
    onUpdateRadioButtons: (displayLine: NavigatorLinesMode) => void;
};

type NavigatorSelectorProps = {
    selectedLines: string[];
    lines: string[];
    onUpdateSelectedLines: (selectedLines: string[]) => void;
};

type NavigatorPeriodProps = {
    periodSettings: NavigatorPeriod;
    onUpdatePeriod: (periodSettings: NavigatorPeriod) => void;
};

export type NavigatorSubSettingsProps = NavigatorPeriodProps &
    NavigatorSelectorProps &
    NavigatorRadioButtonsProps;

const b = block('sub-navigator-settings');
const DATE_PERIOD_ITEMS: SelectOption[] = [
    {
        value: 'day',
        content: i18n('wizard', 'label_day'),
    },
    {
        value: 'week',
        content: i18n('wizard', 'label_week'),
    },
    {
        value: 'month',
        content: i18n('wizard', 'label_month'),
    },
    {
        value: 'quarter',
        content: i18n('wizard', 'label_quarter'),
    },
    {
        value: 'year',
        content: i18n('wizard', 'label_year'),
    },
];
const DATE_TIME_PERIOD_ITEMS: SelectOption[] = [
    ...DATE_PERIOD_ITEMS,
    {
        value: 'hour',
        content: i18n('wizard', 'label_hour'),
    },
];
const NavigatorRadioButtons: React.FC<NavigatorRadioButtonsProps> = (
    props: NavigatorRadioButtonsProps,
) => {
    return (
        <RadioButton
            size="m"
            value={props.linesMode}
            qa="navigator-lines-mode"
            onUpdate={(value: string) => {
                props.onUpdateRadioButtons(value as NavigatorLinesMode);
            }}
        >
            <RadioButton.Option value={NavigatorLinesMode.All}>
                {i18n('wizard', 'label_all-lines')}
            </RadioButton.Option>
            <RadioButton.Option value={NavigatorLinesMode.Selected}>
                {i18n('wizard', 'label_choose-lines')}
            </RadioButton.Option>
        </RadioButton>
    );
};

const NavigatorLineSelector: React.FC<NavigatorSelectorProps> = (props: NavigatorSelectorProps) => {
    const options = React.useMemo(() => {
        return props.lines.map((item) => ({
            content: item,
            value: item,
        }));
    }, [props.lines]);

    return (
        <Select
            className={b('navigator-line-selector')}
            onUpdate={props.onUpdateSelectedLines}
            value={props.selectedLines}
            options={options}
            multiple={true}
            qa="navigator-lines-select"
            filterable={true}
        />
    );
};

const NavigatorPeriodSettings: React.FC<NavigatorPeriodProps> = (props: NavigatorPeriodProps) => {
    const [inputValue, setInputValue] = React.useState(props.periodSettings.value);
    const [selectorValue, setSelectorValue] = React.useState(props.periodSettings.period);

    const periodType = props.periodSettings.type;

    React.useEffect(() => {
        props.onUpdatePeriod({value: inputValue, period: selectorValue, type: periodType});
    }, [inputValue, selectorValue]);

    const onUpdate = React.useCallback(
        ([value]) => setSelectorValue(value as Period),
        [setSelectorValue],
    );

    const items =
        periodType === DATASET_FIELD_TYPES.DATE ? DATE_PERIOD_ITEMS : DATE_TIME_PERIOD_ITEMS;

    return (
        <div>
            <span className={b('period-label')}>{i18n('wizard', 'label_default-period')}</span>
            <TextInput
                value={inputValue}
                onUpdate={setInputValue}
                size="s"
                className={b('period-input')}
            />
            <Select
                onUpdate={onUpdate}
                value={[selectorValue]}
                options={items}
                size="s"
                className={b('period-selector')}
            />
        </div>
    );
};

const SubNavigatorSettings: React.FC<NavigatorSubSettingsProps> = (
    props: NavigatorSubSettingsProps,
) => {
    const showSelector = props.linesMode === NavigatorLinesMode.Selected;

    return (
        <div className={b()}>
            <NavigatorRadioButtons
                linesMode={props.linesMode}
                onUpdateRadioButtons={props.onUpdateRadioButtons}
            />
            {showSelector && (
                <NavigatorLineSelector
                    lines={props.lines}
                    selectedLines={props.selectedLines}
                    onUpdateSelectedLines={props.onUpdateSelectedLines}
                />
            )}
            <NavigatorPeriodSettings
                periodSettings={props.periodSettings}
                onUpdatePeriod={props.onUpdatePeriod}
            />
        </div>
    );
};

export default SubNavigatorSettings;
