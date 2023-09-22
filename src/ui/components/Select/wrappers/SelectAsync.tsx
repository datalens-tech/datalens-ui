import React from 'react';

import {SelectProps, Select as UIKitSelect} from '@gravity-ui/uikit';

import {
    UseSelectAsyncFetch,
    useSelectAsyncFetch,
} from '../hooks/useSelectAsyncFetch/useSelectAsyncFetch';

type SelectWithAsyncFetchingProps = SelectProps & UseSelectAsyncFetch;

export const SelectAsync = (props: SelectWithAsyncFetchingProps) => {
    const {onFetch, options, renderOption, loading} = props;
    const asyncProps = useSelectAsyncFetch({
        options,
        renderOption,
        onFetch,
        loading,
    });
    return <UIKitSelect {...props} {...asyncProps} />;
};
