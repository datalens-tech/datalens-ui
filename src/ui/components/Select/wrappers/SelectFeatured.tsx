import React from 'react';

import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';

import {SelectStyles} from '../constants/SelectStyles';
import {useSelectOptionsEnhancer} from '../hooks/useSelectOptionsEnhancer';
import type {UseSelectRenderEmptyOptionsProps} from '../hooks/useSelectRenderEmptyOptions/useSelectRenderEmptyOptions';
import {useSelectRenderEmptyOptions} from '../hooks/useSelectRenderEmptyOptions/useSelectRenderEmptyOptions';
import type {UseSelectRenderErrorProps} from '../hooks/useSelectRenderError';
import {useSelectRenderError} from '../hooks/useSelectRenderError';
import type {UseSelectRenderFilter} from '../hooks/useSelectRenderFilter/useSelectRenderFilter';
import {useSelectRenderFilter} from '../hooks/useSelectRenderFilter/useSelectRenderFilter';

import '../styles/SelectUtil.scss';

export type SelectFeaturedProps<T = any> = {
    options: SelectOption<T>[];
    hasValidationError?: boolean;
    onRetry?: () => void;
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
        onRetry: () => {
            resetFilterState();
            props.onRetry?.();
        },
    });

    const renderEmptyOptions = useSelectRenderEmptyOptions({
        emptyOptionsText: props.emptyOptionsText,
        renderEmptyOptions: renderEmptyOptionsError,
    });

    return (
        <Select
            {...props}
            popupClassName={SelectStyles.Popup}
            error={Boolean(props.error || props.hasValidationError)}
            filterable={props.error ? false : filterable}
            renderEmptyOptions={renderEmptyOptions}
            onFilterChange={undefined}
            options={options}
            renderFilter={props.error ? undefined : renderFilter}
        />
    );
};
