import React from 'react';

import {SelectOption} from '@gravity-ui/uikit';
import compact from 'lodash/compact';
import {useSelectAsyncFetch} from 'ui/components/Select/hooks/useSelectAsyncFetch/useSelectAsyncFetch';
import {Fetcher} from 'ui/components/Select/hooks/useSelectInfinityFetch/types';
import {useInfinityFetch} from 'ui/components/Select/hooks/useSelectInfinityFetch/useSelectInfinityFetch';

import {useSelectOptionsEnhancer} from '../hooks/useSelectOptionsEnhancer';

import {SelectFeatured, SelectFeaturedProps} from './SelectFeatured';

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

    const respsFlat = React.useMemo(
        () => compact(responses.map(({response}) => response).flat()),
        [responses],
    );

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
