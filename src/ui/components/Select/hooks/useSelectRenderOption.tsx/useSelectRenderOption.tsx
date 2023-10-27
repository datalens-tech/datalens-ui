import React, {useCallback} from 'react';

import {SelectOption, SelectProps} from '@gravity-ui/uikit';

import {DefaultOption} from '../../components/DefaultOption/DefaultOption';

import {OptionSelectionMode, SelectMultiOption} from './SelectMultiOption';

import './SelectMultiOption.scss';

export type UseSelectRenderOptionProps<T = any> = {options: SelectOption<T>[]} & Pick<
    SelectProps,
    'options' | 'multiple' | 'onUpdate'
>;

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
            return multiple ? (
                <SelectMultiOption option={opt} onClick={handleClick} />
            ) : (
                <DefaultOption option={opt} />
            );
        },
        [handleClick, multiple],
    );

    return {renderOption};
};
