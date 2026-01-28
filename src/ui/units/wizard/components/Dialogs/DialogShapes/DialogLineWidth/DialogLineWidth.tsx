import React from 'react';

import {Flex, Text} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import NumberInput from 'ui/components/NumberFormatSettings/NumberInput/NumberInput';
import {
    LINE_WIDTH_AUTO_VALUE,
    LINE_WIDTH_MAX_VALUE,
    LINE_WIDTH_MIN_VALUE,
} from 'ui/units/wizard/constants/shapes';

import {LineWidthSelect} from '../../../LineWidthSelect/LineWidthSelect';

interface DialogLineWidthProps {
    value: string;
    onChange: (lineWidth: string) => void;
    style?: React.CSSProperties;
    allowDefault?: boolean;
}

export const DialogLineWidth = React.memo(
    ({value, onChange, allowDefault, style}: DialogLineWidthProps) => {
        const handleNumberInputChange = React.useCallback(
            (nextValue: number) => {
                return onChange(nextValue.toString());
            },
            [onChange],
        );

        const isAutoValue = value === LINE_WIDTH_AUTO_VALUE;

        const numberInput = React.useMemo(() => {
            if (isAutoValue) {
                return null;
            }

            const valueNumber = Number.parseInt(value, 10);

            if (Number.isNaN(valueNumber)) {
                return null;
            }

            return (
                <Flex direction="row" alignItems="center" justifyContent="flex-end">
                    <NumberInput
                        value={valueNumber}
                        min={LINE_WIDTH_MIN_VALUE}
                        max={LINE_WIDTH_MAX_VALUE}
                        onChange={handleNumberInputChange}
                    />
                </Flex>
            );
        }, [handleNumberInputChange, value, isAutoValue]);

        return (
            <Flex direction="column" gap={2} style={style}>
                <Flex direction="row" alignItems="center" justifyContent="space-between">
                    <Text variant="body-1">{i18n('wizard', 'label_dialog-line-width')}</Text>
                    <LineWidthSelect
                        allowDefault={allowDefault}
                        value={value}
                        onChange={onChange}
                    />
                </Flex>
                {numberInput}
            </Flex>
        );
    },
);

DialogLineWidth.displayName = 'DialogLineWidth';
