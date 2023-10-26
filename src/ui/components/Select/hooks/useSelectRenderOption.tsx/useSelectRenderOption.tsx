import React, {useCallback} from 'react';

import {Button, Flex, SelectOption, SelectProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './SelectOption.scss';

export type UseSelectRenderOptionProps<T = any> = {options: SelectOption<T>[]} & Pick<
    SelectProps,
    'options' | 'multiple' | 'onUpdate' | 'value' | 'renderOption'
>;

const i18n = I18n.keyset('components.common.YCSelect');
const b = block('select-option');

type OptionSelectionMode = 'only' | 'except';
type OptionProps<T = any> = {
    option: SelectOption<T>;
    onClick: (value: string, mode: OptionSelectionMode) => void;
};

const Option = (props: OptionProps) => {
    const [mode, setMode] = React.useState<'only' | 'except'>('only');

    const {option, onClick} = props;

    return (
        <Flex className={b()} alignItems={'center'} justifyContent={'space-between'}>
            {option.content}
            <Button
                className={b('action-button')}
                size="s"
                onFocus={(e: React.FocusEvent<HTMLButtonElement, HTMLElement>) =>
                    e?.relatedTarget?.focus()
                }
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(option.value, mode);
                    setMode(mode === 'only' ? 'except' : 'only');
                }}
            >
                {i18n(`item_${mode}`)}
            </Button>
        </Flex>
    );
};

export const useSelectRenderOption = ({
    options,
    multiple,
    onUpdate,
    renderOption,
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

    const handleRenderOption = useCallback(
        (opt, opts) => {
            if (renderOption && opt.value === 'LOADER' && opt.value === 'LOADER_PERSISTENT') {
                return renderOption(opt, opts);
            }
            return <Option option={opt} onClick={handleClick} />;
        },
        [handleClick, renderOption],
    );

    return {renderOption: multiple ? handleRenderOption : undefined};
};
