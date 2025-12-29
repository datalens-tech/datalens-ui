import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Flex, Icon, Select, type SelectProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {
    LINE_WIDTH_MAX_VALUE,
    LINE_WIDTH_MIN_VALUE,
    LINE_WIDTH_VALUE_STEP,
} from '../../constants/shapes';

import './LineWidthSelect.scss';

const b = block('dl-line-width-select');

interface LineWidthSelectProps {
    value: number;
    onChange: (lineWidth: number) => void;
}

const EMPTY_VALUE: string[] = [];

export const LineWidthSelect = React.memo(({value, onChange}: LineWidthSelectProps) => {
    const handleUpdate = React.useCallback(
        (values: string[]) => {
            const [nextLineWidth] = values;
            const nextLineWidthNumber = Number.parseInt(nextLineWidth, 10);

            if (Number.isNaN(nextLineWidth)) {
                return;
            }

            onChange(nextLineWidthNumber);
        },
        [onChange],
    );

    const options = React.useMemo(() => {
        const result = [];

        for (let i = LINE_WIDTH_MIN_VALUE; i <= LINE_WIDTH_MAX_VALUE; i += LINE_WIDTH_VALUE_STEP) {
            result.push(
                <Select.Option key={i} value={i.toString()}>
                    <Flex style={{height: '100%'}} direction="column" justifyContent="center">
                        <span className={b('option-line')} style={{height: `${i}px`}} />
                    </Flex>
                </Select.Option>,
            );
        }

        return result;
    }, []);

    const selectValue: string[] = React.useMemo(() => {
        if (value === null) {
            return EMPTY_VALUE;
        }

        return [value.toString()];
    }, [value]);

    const renderControl: SelectProps['renderControl'] = React.useCallback(
        (props) => {
            return (
                <Flex
                    {...props.triggerProps}
                    className={b('control')}
                    direction="row"
                    alignItems="center"
                    gap={2}
                >
                    <span className={b('option-line')} style={{height: `${value}px`}} />
                    <Icon data={ChevronDown} />
                </Flex>
            );
        },
        [value],
    );

    const renderSelectedOption = React.useCallback((option) => {
        return option.children;
    }, []);

    return (
        <Select
            value={selectValue}
            width={136}
            renderControl={renderControl}
            renderSelectedOption={renderSelectedOption}
            onUpdate={handleUpdate}
        >
            {options}
        </Select>
    );
});

LineWidthSelect.displayName = 'LineWidthSelect';
