import React from 'react';

import {Select, SelectOption, SelectProps} from '@gravity-ui/uikit';

import {SelectStyles} from '../constants/SelectStyles';
import {useSelectOptionsEnhancer} from '../hooks/useSelectOptionsEnhancer';
import {
    UseSelectRenderEmptyOptionsProps,
    useSelectRenderEmptyOptions,
} from '../hooks/useSelectRenderEmptyOptions/useSelectRenderEmptyOptions';
import {UseSelectRenderErrorProps, useSelectRenderError} from '../hooks/useSelectRenderError';
import {
    UseSelectRenderFilter,
    useSelectRenderFilter,
} from '../hooks/useSelectRenderFilter/useSelectRenderFilter';
import {useSelectRenderOption} from '../hooks/useSelectRenderOption.tsx/useSelectRenderOption';

import '../styles/SelectUtil.scss';

export type SelectFeaturedProps<T = any> = {
    options: SelectOption<T>[];
} & Omit<SelectProps, 'options' | 'onFilterChange' | 'error'> &
    UseSelectRenderFilter &
    UseSelectRenderEmptyOptionsProps &
    Pick<UseSelectRenderErrorProps, 'error'>;

export const SelectFeatured = <T,>({filterable = true, ...props}: SelectFeaturedProps<T>) => {
    const enhancedOptions = useSelectOptionsEnhancer(props.options);

    const {renderFilter, options, resetFilterState} = useSelectRenderFilter({
        ...props,
        options: enhancedOptions,
    });

    const {renderEmptyOptions: renderEmptyOptionsError} = useSelectRenderError({
        error: props.error,
        onRetry: resetFilterState,
    });

    const renderEmptyOptions = useSelectRenderEmptyOptions({
        emptyOptionsText: props.emptyOptionsText,
        renderEmptyOptions: renderEmptyOptionsError,
    });

    const {renderOption} = useSelectRenderOption(props);

    return (
        <Select
            {...props}
            popupClassName={SelectStyles.Popup}
            error={Boolean(props.error)}
            filterable={props.error ? false : filterable}
            renderEmptyOptions={renderEmptyOptions}
            onFilterChange={undefined}
            options={options}
            renderFilter={props.error ? undefined : renderFilter}
            renderOption={renderOption}
        />
    );
};
