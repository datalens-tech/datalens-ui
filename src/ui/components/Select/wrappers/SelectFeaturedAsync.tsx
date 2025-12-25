import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import compact from 'lodash/compact';
import {useSelectAsyncFetch} from 'ui/components/Select/hooks/useSelectAsyncFetch/useSelectAsyncFetch';
import type {Fetcher} from 'ui/components/Select/hooks/useSelectInfinityFetch/types';
import {useInfinityFetch} from 'ui/components/Select/hooks/useSelectInfinityFetch/useSelectInfinityFetch';

import {useSelectOptionsEnhancer} from '../hooks/useSelectOptionsEnhancer';

import type {SelectFeaturedProps} from './SelectFeatured';
import {SelectFeatured} from './SelectFeatured';

const isValidSelectOption = (item: SelectOption): item is SelectOption => {
    if (!item || typeof item !== 'object') {
        return false;
    }

    const hasStringContent = typeof item.content === 'string';
    const hasStringChildren = typeof item.children === 'string';
    const hasText = Boolean(item.text);
    const hasValue = typeof item.value === 'string';

    return hasValue || hasStringContent || hasStringChildren || hasText;
};

export type SelectFeaturedAsyncProps<Option extends SelectOption = any, Pagination = any> = {
    fetcher: Fetcher<SelectOption<Option>[], Pagination>;
} & Omit<SelectFeaturedProps<Option>, 'options'>;

export const SelectFeaturedAsync = <Option extends SelectOption = any, Pagination = any>(
    props: SelectFeaturedAsyncProps<Option, Pagination>,
) => {
    const {responses, onFetchInfinity, isLoadingInitial, error} = useInfinityFetch<
        SelectOption<Option>[],
        Pagination
    >({
        fetcher: props.fetcher,
    });

    const respsFlat = React.useMemo(() => {
        const rawData = compact(responses.map(({response}) => response).flat());
        const filteredData = rawData.filter(isValidSelectOption);
        return filteredData;
    }, [responses]);

    const handledOptions = useSelectOptionsEnhancer(respsFlat);

    const selectLoadingProps = useSelectAsyncFetch<SelectOption>({
        ...props,
        options: handledOptions,
        loading: isLoadingInitial,
        onFetch: onFetchInfinity,
    });

    return (
        <SelectFeatured
            {...props}
            {...selectLoadingProps}
            disableUIKitFilterAlgorithm
            error={error}
        />
    );
};
