import React from 'react';

import {SelectOption} from '@gravity-ui/uikit';
import compact from 'lodash/compact';
import {Fetcher} from 'ui/components/Select/hooks/useSelectInfinityFetch/types';
import {useInfinityFetch} from 'ui/components/Select/hooks/useSelectInfinityFetch/useSelectInfinityFetch';

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

    return (
        <SelectFeatured
            {...props}
            options={respsFlat}
            disableUIKitFilterAlgorithm
            error={error}
            loading={isLoadingInitial}
            onFetch={onFetchInfinity}
        />
    );
};
