import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {NumberInput, Select, Text, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {LineShapeType} from 'shared';
import {getShapedLineIcon} from 'ui/utils/line-shapes';

import {i18n} from '../../i18n';

import './LineWidth.scss';

const b = block('dialog-line-shapes');

const LINE_WIDTH_AUTO = 'auto';
const MAX_LINE_WIDTH = 12;

const LINE_WIDTH_SELECT_OPTIONS: SelectOption[] = [
    {value: LINE_WIDTH_AUTO},
    ...new Array(MAX_LINE_WIDTH).fill(null).map((_, index) => ({value: String(index + 1)})),
];

export const LineWidthControl = ({
    value,
    defaultValue,
    onChange,
}: {
    value: number | 'auto' | undefined;
    defaultValue?: number | 'auto';
    onChange: (value: number | 'auto' | undefined) => void;
}) => {
    const handleSelectWidth = React.useCallback(
        (val: string[]) => {
            onChange(val[0] === LINE_WIDTH_AUTO ? LINE_WIDTH_AUTO : Number(val[0]));
        },
        [onChange],
    );

    const handleUpdateWidth = React.useCallback(
        (val: number | null) => {
            const newValue = val ? Math.max(1, Math.min(MAX_LINE_WIDTH, val)) : undefined;
            onChange(newValue);
        },
        [onChange],
    );

    const renderWidthSelectOption = React.useCallback(
        ({
            value: optionValue,
            defaultValue: defaultOptionValue,
            width,
        }: {
            value: string;
            defaultValue?: string;
            width: number;
        }) => {
            if (optionValue === LINE_WIDTH_AUTO) {
                return (
                    <React.Fragment>
                        {i18n('label_auto')}
                        {defaultOptionValue && defaultOptionValue !== LINE_WIDTH_AUTO && (
                            <Text color="secondary" className={spacing({ml: 1})}>
                                {defaultOptionValue}px
                            </Text>
                        )}
                    </React.Fragment>
                );
            }

            return (
                <div className={b('line-width-select-icon')}>
                    {getShapedLineIcon({
                        shape: LineShapeType.Solid,
                        width,
                        height: Number(optionValue),
                    })}
                </div>
            );
        },
        [],
    );

    return (
        <React.Fragment>
            <Select
                value={[String(value ?? LINE_WIDTH_AUTO)]}
                onUpdate={handleSelectWidth}
                options={LINE_WIDTH_SELECT_OPTIONS}
                renderOption={({value: item}) => renderWidthSelectOption({value: item, width: 112})}
                renderSelectedOption={({value: item}) =>
                    renderWidthSelectOption({
                        value: item,
                        defaultValue: defaultValue ? String(defaultValue) : LINE_WIDTH_AUTO,
                        width: 80,
                    })
                }
                width="max"
            />
            {value !== LINE_WIDTH_AUTO && (
                <div className={b('line-width-input')}>
                    <NumberInput
                        min={1}
                        max={12}
                        step={1}
                        value={value}
                        onUpdate={handleUpdateWidth}
                        onBlur={() => {
                            if (!value) {
                                onChange(LINE_WIDTH_AUTO);
                            }
                        }}
                    />
                    <Text>px</Text>
                </div>
            )}
        </React.Fragment>
    );
};
