import type {SelectProps} from '@gravity-ui/uikit';

import type {Fetcher} from '../../../../../../../../../components/Select/hooks/useSelectInfinityFetch/types';
import type {SelectFeaturedAsyncProps} from '../../../../../../../../../components/Select/wrappers/SelectFeaturedAsync';

import type {PaginationType} from './DynamicValueSelect';

export type StaticValueSelectorProps = CommonValueSelectorProps;
export type DynamicValueSelectorProps = CommonValueSelectorProps & DynamicValueSelectorCustomProps;

export type DynamicValueSelectorCustomProps = FetcherProps & FilterProps & ValueSelectorExtraProps;

export type CommonValueSelectorProps = {
    hasValidationError: boolean;
    hasClear?: boolean;
};

export type FetcherProps = {fetcher: Fetcher<any, PaginationType>; onRetry?: () => void};
export type FilterProps = {
    onFilterChange?: NonNullable<SelectFeaturedAsyncProps['onFilterChange']>;
};
export type ValueSelectorExtraProps = Pick<SelectProps, 'disabled' | 'filterable'>;
