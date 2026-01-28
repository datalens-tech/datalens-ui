import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Flex, Icon, Select, type SelectProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DialogShapeSettings} from 'shared';

import {
    LINE_WIDTH_AUTO_VALUE,
    LINE_WIDTH_MAX_VALUE,
    LINE_WIDTH_MIN_VALUE,
    LINE_WIDTH_VALUE_STEP,
} from '../../constants/shapes';

import './LineWidthSelect.scss';

const b = block('dl-line-width-select');

interface LineWidthSelectProps {
    value: string;
    onChange: (lineWidth: string) => void;
    allowDefault?: boolean;
}

const EMPTY_VALUE: string[] = [];
const SELECT_WIDTH = 136;

export const LineWidthSelect = React.memo(
    ({value, onChange, allowDefault}: LineWidthSelectProps) => {
        const handleUpdate = React.useCallback(
            (values: string[]) => {
                const [nextLineWidth] = values;

                onChange(nextLineWidth);
            },
            [onChange],
        );

        const options = React.useMemo(() => {
            const result = [];

            if (allowDefault) {
                result.push(
                    <Select.Option
                        key={LINE_WIDTH_AUTO_VALUE}
                        value={LINE_WIDTH_AUTO_VALUE}
                        qa={DialogShapeSettings.LineWidthSelectOption}
                    >
                        <Flex style={{height: '100%'}} direction="column" justifyContent="center">
                            {i18n('wizard', 'label_line-width-auto-value')}
                        </Flex>
                    </Select.Option>,
                );
            }

            for (
                let i = LINE_WIDTH_MIN_VALUE;
                i <= LINE_WIDTH_MAX_VALUE;
                i += LINE_WIDTH_VALUE_STEP
            ) {
                const optionValue = i.toString();

                result.push(
                    <Select.Option
                        key={optionValue}
                        value={optionValue}
                        qa={DialogShapeSettings.LineWidthSelectOption}
                    >
                        <Flex style={{height: '100%'}} direction="column" justifyContent="center">
                            <span
                                className={b('option-line')}
                                style={{height: `${optionValue}px`}}
                                data-qa={optionValue}
                            />
                        </Flex>
                    </Select.Option>,
                );
            }

            return result;
        }, [allowDefault]);

        const selectValue: string[] = React.useMemo(() => {
            if (!value) {
                return EMPTY_VALUE;
            }

            return [value];
        }, [value]);

        const renderControl: SelectProps['renderControl'] = React.useCallback(
            (props) => {
                const isAutoValue = allowDefault && value === LINE_WIDTH_AUTO_VALUE;

                return (
                    <Flex
                        {...props.triggerProps}
                        className={b('control')}
                        direction="row"
                        alignItems="center"
                        gap={2}
                        qa={DialogShapeSettings.LineWidthSelectControl}
                    >
                        {isAutoValue ? (
                            <span>{i18n('wizard', 'label_line-width-auto-value')}</span>
                        ) : (
                            <span className={b('option-line')} style={{height: `${value}px`}} />
                        )}
                        <Icon data={ChevronDown} />
                    </Flex>
                );
            },
            [value, allowDefault],
        );

        const renderSelectedOption = React.useCallback((option) => {
            return option.children;
        }, []);

        return (
            <Select
                value={selectValue}
                width={SELECT_WIDTH}
                renderControl={renderControl}
                renderSelectedOption={renderSelectedOption}
                onUpdate={handleUpdate}
            >
                {options}
            </Select>
        );
    },
);

LineWidthSelect.displayName = 'LineWidthSelect';
