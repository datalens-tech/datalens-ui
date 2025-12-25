import React from 'react';

import type {
    SelectOption,
    SelectProps,
    SelectRenderOption,
    SelectRenderOptionViewParams,
} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import {useMountedState} from 'ui/hooks/useMountedState';

import {useIntersection} from './useIntersection';

import './CustomLoader.scss';

const LOADER = 'LOADER';
const LOADER_PERSISTENT = 'LOADER_PERSISTENT';
const loaderOption = {value: LOADER, content: LOADER, disabled: true};
const loaderPersistentOption = {
    value: LOADER_PERSISTENT,
    content: LOADER_PERSISTENT,
    disabled: true,
};

const CustomLoader = (props: {onIntersect?: () => void}) => {
    const [bottomRef, setBottomRef] = React.useState<HTMLDivElement | null>(null);

    useIntersection({element: bottomRef, onIntersect: props?.onIntersect});

    return (
        <div className="custom-loader-container" ref={setBottomRef}>
            <Loader />
        </div>
    );
};

export type UseSelectAsyncFetch<T = any> = {
    onFetch?: () => void | Promise<any>;
    loading?: boolean;
    options: T[];
} & Pick<SelectProps, 'renderOption' | 'filterOption'>;

export const useSelectAsyncFetch = <T,>({
    options = [],
    renderOption,
    onFetch,
    loading,
    filterOption,
}: UseSelectAsyncFetch<T>) => {
    const isMounted = useMountedState();
    const [isFetching, setIsFetching] = React.useState(false);
    const localOptions = React.useMemo(() => {
        if (loading) {
            return [loaderPersistentOption];
        }
        if (!options?.length) {
            return options;
        }

        return onFetch ? [...options, loaderOption] : options;
    }, [options, onFetch, loading]);

    const handleFetch = React.useCallback(() => {
        if (isFetching) {
            return;
        }

        const promise = onFetch?.();
        if (promise) {
            setIsFetching(true);
            promise.finally(() => {
                if (!isMounted()) {
                    return;
                }

                setIsFetching(false);
            });
        }
    }, [onFetch, isFetching, isMounted]);

    const handleRenderOption: SelectRenderOption<any> = React.useCallback(
        (option: SelectOption, viewParams: SelectRenderOptionViewParams) => {
            switch (option.content) {
                case LOADER:
                    return <CustomLoader onIntersect={handleFetch} />;
                case LOADER_PERSISTENT:
                    return <CustomLoader />;
                default:
                    return (
                        renderOption?.(option, viewParams) ||
                        ((
                            <div className="custom-option" title={String(option.content)}>
                                {option.content}
                            </div>
                        ) as React.ReactElement)
                    );
            }
        },
        [handleFetch, renderOption],
    );

    const handleFilterOption = React.useMemo(
        () => (loading ? () => true : filterOption),
        [loading, filterOption],
    );

    return {
        options: localOptions,
        renderOption: handleRenderOption,
        filterOption: handleFilterOption,
    };
};
