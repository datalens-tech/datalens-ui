import React from 'react';

import {i18n} from 'i18n';

import {DL, RUBLE} from '../../constants';

type FormattedValueKind = 'byte' | 'number' | 'price';

export interface FormatterOptions {
    value: number;
    type: FormattedValueKind;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
}

const LOCALES = {
    en: 'en-US',
    ru: 'ru-RU',
};

export const MEMORY_UNITS = ['b', 'kb', 'mb', 'gb', 'tb'] as const;

export function getMemoryUnit(bytes: number): (typeof MEMORY_UNITS)[number] | undefined {
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return MEMORY_UNITS[index];
}

function getNumberFormat({
    type,
    currency,
    minimumFractionDigits = 0,
    maximumFractionDigits,
}: FormatterOptions) {
    let options: Intl.NumberFormatOptions = {
        minimumFractionDigits,
        maximumFractionDigits: maximumFractionDigits || minimumFractionDigits,
    };
    if (type === 'price') {
        options = {
            ...options,
            style: 'currency',
            currency: currency || 'RUB',
            currencyDisplay: 'symbol',
        };
    }
    const lang = DL.USER_LANG as keyof typeof LOCALES;
    return new Intl.NumberFormat(LOCALES[lang], options);
}

function formatBytes(options: FormatterOptions) {
    const {value} = options;
    if (value <= 0) {
        const bytesUnit = i18n('component.formatted-value.view', `label_memory-${MEMORY_UNITS[0]}`);
        return `0 ${bytesUnit}`;
    }

    const numberFormat = getNumberFormat(options);
    const i = Math.floor(Math.log(value) / Math.log(1024));
    const unit = i18n('component.formatted-value.view', `label_memory-${MEMORY_UNITS[i]}`);

    if (i === 0) {
        return `${numberFormat.format(value)} ${unit}`;
    }

    return `${numberFormat.format(value / 1024 ** i)} ${unit}`;
}

function formatNumber(options: FormatterOptions) {
    const numberFormat = getNumberFormat(options);
    let value = numberFormat.format(options.value);
    if (options.type === 'price') {
        value = value.replace(/RUB/g, RUBLE);
    }
    return value;
}

export function getFormattedValue(options: FormatterOptions): string {
    const {type} = options;
    switch (type) {
        case 'byte': {
            return formatBytes(options);
        }
        case 'price':
        case 'number':
        default: {
            return formatNumber(options);
        }
    }
}

export interface FormattedValueProps extends Omit<FormatterOptions, 'type'> {
    type?: FormattedValueKind;
    className?: string;
}

const FormattedValue: React.FC<FormattedValueProps> = (props) => {
    const {className, type = 'number', ...restProps} = props;
    return (
        <span className={className}>
            {getFormattedValue({
                ...restProps,
                type,
            })}
        </span>
    );
};

export default FormattedValue;
