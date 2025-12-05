import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Flex, Icon, Select, type SelectProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './LineWidthSelect.scss';

const b = block('dl-line-width-select');

const LINE_WIDTH_MAX_VALUE = 12;
const LINE_WIDTH_VALUE_STEP = 1;

export const LineWidthSelect = React.memo(() => {
    const options = React.useMemo(() => {
        const result = [];

        for (let i = 0; i < LINE_WIDTH_MAX_VALUE; i += LINE_WIDTH_VALUE_STEP) {
            const value = i + 1;

            result.push(
                <Select.Option value={value.toString()}>
                    <Flex style={{height: '100%'}} direction="column" justifyContent="center">
                        <span className={b('option-line')} style={{height: `${value}px`}} />
                    </Flex>
                </Select.Option>,
            );
        }

        return result;
    }, []);

    const renderControl: SelectProps['renderControl'] = React.useCallback((props, options) => {
        return (
            <Flex
                {...props.triggerProps}
                className={b('control')}
                direction="row"
                alignItems="center"
                gap={2}
            >
                <span className={b('option-line')} style={{height: `${4}px`}} />
                <Icon data={ChevronDown} />
            </Flex>
        );
    }, []);

    const renderSelectedOption = React.useCallback((option) => {
        return option.children;
    }, []);

    return (
        <Select
            width={136}
            renderControl={renderControl}
            renderSelectedOption={renderSelectedOption}
        >
            {options}
        </Select>
    );
});

LineWidthSelect.displayName = 'LineWidthSelect';
