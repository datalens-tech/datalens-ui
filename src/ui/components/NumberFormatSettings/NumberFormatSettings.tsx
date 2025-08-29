import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {SegmentedRadioGroup as RadioButton, Select, TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {CommonNumberFormattingOptions} from 'shared';
import {
    DATASET_FIELD_TYPES,
    DialogFieldMainSectionQa,
    NumberFormatType,
    NumberFormatUnit,
} from 'shared';

import NumberInput from './NumberInput/NumberInput';

type Props = {
    dataType: DATASET_FIELD_TYPES;
    formatting?: CommonNumberFormattingOptions;
    onChange: (formatting: CommonNumberFormattingOptions) => void;
    rowClassName?: string;
    isAxisFormatting?: boolean;
};

const i18n = I18n.keyset('component.number-field-formatting.view');

function setDefaultFormatting(data: Props) {
    const formatting: Required<CommonNumberFormattingOptions> = Object.assign(
        {
            format: NumberFormatType.Number,
            showRankDelimiter: true,
            prefix: '',
            postfix: '',
            unit: null,
            // so you can rewrite the values with explicit undefined, but we believe that there will be no such situation, therefore as
        },
        data.formatting as CommonNumberFormattingOptions,
    );

    if (data.dataType === DATASET_FIELD_TYPES.FLOAT || data.isAxisFormatting) {
        const minimumFractionDigits = data.dataType !== DATASET_FIELD_TYPES.FLOAT && data.isAxisFormatting ? 0 : 2
        formatting.precision = formatting.precision ?? minimumFractionDigits;
    } else {
        formatting.precision = 0;
    }

    return {...data, formatting};
}

const getUnitItems = () => [
    {
        content: i18n('value_unit-null'),
        value: '',
    },
    {
        content: i18n('value_unit-auto'),
        value: NumberFormatUnit.Auto,
    },
    {
        content: i18n('value_unit-k'),
        value: NumberFormatUnit.K,
    },
    {
        content: i18n('value_unit-m'),
        value: NumberFormatUnit.M,
    },
    {
        content: i18n('value_unit-b'),
        value: NumberFormatUnit.B,
    },
    {
        content: i18n('value_unit-t'),
        value: NumberFormatUnit.T,
    },
];

export const NumberFormatSettings = (props: Props) => {
    const {onChange, formatting, rowClassName} = setDefaultFormatting(props);

    const isShowDigitsAfterDot = props.dataType === DATASET_FIELD_TYPES.FLOAT || props.isAxisFormatting

    const handleChange = React.useCallback(
        (data: Partial<Props['formatting']>) => {
            onChange({
                ...formatting,
                ...data,
            });
        },
        [onChange, formatting],
    );

    const handleChangeFormat = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newFormat = event.target.value as NumberFormatType;

            // Reset unit if changing format to percent
            const newUnit = newFormat === NumberFormatType.Percent ? undefined : formatting.unit;

            handleChange({format: newFormat, unit: newUnit});
        },
        [handleChange, formatting.unit],
    );

    const handleChangeUnit = React.useCallback(
        (value: string[]) => handleChange({unit: (value[0] as NumberFormatUnit) || undefined}),
        [handleChange],
    );

    return (
        <React.Fragment>
            <FormRow className={rowClassName} label={i18n('field_format')}>
                <RadioButton
                    size="m"
                    value={formatting.format}
                    onChange={handleChangeFormat}
                    qa={DialogFieldMainSectionQa.NumberFormat}
                >
                    <RadioButton.Option value={NumberFormatType.Number}>
                        {i18n(`value_format-${NumberFormatType.Number}`)}
                    </RadioButton.Option>
                    <RadioButton.Option value={NumberFormatType.Percent}>
                        {i18n(`value_format-${NumberFormatType.Percent}`)}
                    </RadioButton.Option>
                </RadioButton>
            </FormRow>
            {isShowDigitsAfterDot && (
                <FormRow className={rowClassName} label={i18n('field_precision')}>
                    <NumberInput
                        qa="precision-input"
                        value={formatting.precision}
                        // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
                        // see the description of the minimumFractionDigits option
                        min={0}
                        max={20}
                        onChange={(precision) => handleChange({precision})}
                    />
                </FormRow>
            )}
            <FormRow className={rowClassName} label={i18n('field_rank-delimiter')}>
                <RadioButton
                    size="m"
                    value={formatting.showRankDelimiter.toString()}
                    onChange={(event) => {
                        if (event.target.value === 'true') {
                            handleChange({showRankDelimiter: true});
                        }
                        if (event.target.value === 'false') {
                            handleChange({showRankDelimiter: false});
                        }
                    }}
                >
                    <RadioButton.Option value="true">
                        {i18n('value_rank-delimiter-show')}
                    </RadioButton.Option>
                    <RadioButton.Option value="false">
                        {i18n('value_rank-delimiter-hide')}
                    </RadioButton.Option>
                </RadioButton>
            </FormRow>
            <FormRow className={rowClassName} label={i18n('field_prefix')}>
                <TextInput
                    size="m"
                    value={formatting.prefix}
                    onUpdate={(prefix) => handleChange({prefix})}
                    qa={DialogFieldMainSectionQa.PrefixInput}
                />
            </FormRow>
            <FormRow className={rowClassName} label={i18n('field_postfix')}>
                <TextInput
                    size="m"
                    value={formatting.postfix}
                    onUpdate={(postfix) => handleChange({postfix})}
                    qa={DialogFieldMainSectionQa.PostfixInput}
                />
            </FormRow>
            {formatting.format !== NumberFormatType.Percent && (
                <FormRow className={rowClassName} label={i18n('field_units')}>
                    <Select
                        width={'max'}
                        options={getUnitItems()}
                        value={[formatting.unit || '']}
                        onUpdate={handleChangeUnit}
                    />
                </FormRow>
            )}
        </React.Fragment>
    );
};
