import React, {useCallback} from 'react';

import {Button, Flex, SelectOption, SelectProps} from '@gravity-ui/uikit';

import './SelectOption.scss';

export type UseSelectRenderOptionProps<T = any> = {options: SelectOption<T>[]} & Pick<
    SelectProps,
    'options' | 'multiple' | 'onUpdate' | 'value'
>;

type OptionSelectionMode = 'only' | 'exclude';
type OptionProps<T = any> = {
    option: SelectOption<T>;
    onClick: (value: string, mode: OptionSelectionMode) => void;
};

const Option = (props: OptionProps) => {
    const [mode, setMode] = React.useState<'only' | 'exclude'>('only');

    const {option, onClick} = props;

    return (
        <Flex className="select-option" alignItems={'center'} justifyContent={'space-between'}>
            {option.content}
            <Button
                className="select-option__action-button"
                onFocus={(e: React.FocusEvent<HTMLButtonElement, HTMLElement>) =>
                    e?.relatedTarget?.focus()
                }
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(option.value, mode);
                    setMode(mode === 'only' ? 'exclude' : 'only');
                }}
            >
                {mode}
            </Button>
        </Flex>
    );
};

export const useSelectRenderOption = ({
    options,
    multiple,
    onUpdate,
}: UseSelectRenderOptionProps) => {
    const handleClick = React.useCallback(
        (val: string, mode: OptionSelectionMode) => {
            if (mode === 'only') {
                onUpdate?.([val]);
            } else {
                onUpdate?.(options?.map(({value}) => value).filter((value) => value !== val));
            }
        },
        [onUpdate, options],
    );

    const renderOption = useCallback(
        (opt) => {
            return <Option option={opt} onClick={handleClick} />;
        },
        [handleClick],
    );

    return {renderOption: multiple ? renderOption : undefined};
};
