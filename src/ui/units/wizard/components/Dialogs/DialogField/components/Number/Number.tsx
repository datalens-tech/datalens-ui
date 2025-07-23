import React from 'react';

import {SegmentedRadioGroup as RadioButton, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {FloatNumberFormattingOptions, IntegerNumberFormattingOptions} from 'shared';
import {
    DATASET_FIELD_TYPES,
    DialogFieldMainSectionQa,
    NumberFormatType,
    NumberFormatUnit,
} from 'shared';
import type {Required} from 'utility-types';

import NumberInput from '../../../../NumberInput/NumberInput';
import {DialogFieldRow} from '../DialogFieldRow/DialogFieldRow';

import './Number.scss';

interface CommonProps {
    onChange: <T>(formatting: T) => void;
}

interface IntegerProps extends CommonProps {
    dataType: DATASET_FIELD_TYPES.INTEGER | DATASET_FIELD_TYPES.UINTEGER;
    formatting?: IntegerNumberFormattingOptions;
    onChange: <IntegerNumberFormat>(formatting: IntegerNumberFormat) => void;
}

interface FloatProps extends CommonProps {
    dataType: DATASET_FIELD_TYPES.FLOAT;
    formatting?: FloatNumberFormattingOptions;
    onChange: <FloatNumberFormat>(formatting: FloatNumberFormat) => void;
}

export type NumberProps = IntegerProps | FloatProps;

type NumberPropsRequiredFormatting =
    | (Omit<IntegerProps, 'formatting'> & {formatting: Required<IntegerNumberFormattingOptions>})
    | (Omit<FloatProps, 'formatting'> & {formatting: Required<FloatNumberFormattingOptions>});

const i18n = I18n.keyset('wizard.number-field-formatting.view');

const b = block('wizard-number-field-formatting');

export function isIntegerNumberFormatting(props: {dataType: unknown}): props is IntegerProps {
    return (
        props.dataType === DATASET_FIELD_TYPES.INTEGER ||
        props.dataType === DATASET_FIELD_TYPES.UINTEGER
    );
}

export function isFloatNumberFormatting(props: {dataType: unknown}): props is FloatProps {
    return props.dataType === DATASET_FIELD_TYPES.FLOAT;
}

function setDefaultFormatting(data: NumberProps): NumberPropsRequiredFormatting {
    const formatting: NumberPropsRequiredFormatting['formatting'] = Object.assign(
        {
            format: NumberFormatType.Number,
            showRankDelimiter: true,
            prefix: '',
            postfix: '',
            unit: null,
            // so you can rewrite the values with explicit undefined, but we believe that there will be no such situation, therefore as
        },
        data.formatting as NumberPropsRequiredFormatting['formatting'],
    );

    if (data.dataType === DATASET_FIELD_TYPES.FLOAT) {
        formatting.precision = formatting.precision ?? 2;
    } else {
        formatting.precision = 0;
    }

    return {...data, formatting} as NumberPropsRequiredFormatting;
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

const Row: React.FC<{label: string}> = (props) => {
    return (
        <DialogFieldRow
            title={props.label}
            setting={<div className={b('control')}>{props.children}</div>}
        />
    );
};

const NumberComponent: React.FC<NumberProps> = (originalProps) => {
    const props = setDefaultFormatting(originalProps);

    const onChange = React.useCallback(
        (data: Partial<NumberProps['formatting']>) => {
            props.onChange({
                ...props.formatting,
                ...data,
            });
        },
        [props],
    );

    const handleChangeFormat = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newFormat = event.target.value as NumberFormatType;

            // Reset unit if changing format to percent
            const newUnit =
                newFormat === NumberFormatType.Percent ? undefined : props.formatting.unit;

            onChange({format: newFormat, unit: newUnit});
        },
        [onChange, props.formatting.unit],
    );

    const handleChangeUnit = React.useCallback(
        (value: string[]) => onChange({unit: (value[0] as NumberFormatUnit) || undefined}),
        [onChange],
    );

    return (
        <div className={b()}>
            <Row label={i18n('field_format')}>
                <RadioButton
                    size="m"
                    value={props.formatting.format}
                    onChange={handleChangeFormat}
                    className={b('lego-control')}
                    qa={DialogFieldMainSectionQa.NumberFormat}
                >
                    <RadioButton.Option value={NumberFormatType.Number}>
                        {i18n(`value_format-${NumberFormatType.Number}`)}
                    </RadioButton.Option>
                    <RadioButton.Option value={NumberFormatType.Percent}>
                        {i18n(`value_format-${NumberFormatType.Percent}`)}
                    </RadioButton.Option>
                </RadioButton>
            </Row>
            {props.dataType === DATASET_FIELD_TYPES.FLOAT && (
                <Row label={i18n('field_precision')}>
                    <NumberInput
                        qa="precision-input"
                        value={props.formatting.precision}
                        // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
                        // see the description of the minimumFractionDigits option
                        min={0}
                        max={20}
                        onChange={(precision) => onChange({precision})}
                    />
                </Row>
            )}
            <Row label={i18n('field_rank-delimiter')}>
                <RadioButton
                    size="m"
                    value={props.formatting.showRankDelimiter.toString()}
                    onChange={(event) => {
                        if (event.target.value === 'true') {
                            onChange({showRankDelimiter: true});
                        }
                        if (event.target.value === 'false') {
                            onChange({showRankDelimiter: false});
                        }
                    }}
                    className={b('lego-control')}
                >
                    <RadioButton.Option value="true">
                        {i18n('value_rank-delimiter-show')}
                    </RadioButton.Option>
                    <RadioButton.Option value="false">
                        {i18n('value_rank-delimiter-hide')}
                    </RadioButton.Option>
                </RadioButton>
            </Row>
            <Row label={i18n('field_prefix')}>
                <TextInput
                    size="m"
                    value={props.formatting.prefix}
                    onUpdate={(prefix) => onChange({prefix})}
                    className={b('lego-control')}
                    qa={DialogFieldMainSectionQa.PrefixInput}
                />
            </Row>
            <Row label={i18n('field_postfix')}>
                <TextInput
                    size="m"
                    value={props.formatting.postfix}
                    onUpdate={(postfix) => onChange({postfix})}
                    className={b('lego-control')}
                    qa={DialogFieldMainSectionQa.PostfixInput}
                />
            </Row>
            {props.formatting.format !== NumberFormatType.Percent && (
                <Row label={i18n('field_units')}>
                    <Select
                        className={b('unit-control')}
                        options={getUnitItems()}
                        value={[props.formatting.unit || '']}
                        onUpdate={handleChangeUnit}
                    />
                </Row>
            )}
        </div>
    );
};

export default NumberComponent;
