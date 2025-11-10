import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import debounce from 'lodash/debounce';
import {usePrevious} from 'ui';

export type ListSearchProps = {
    disabled?: boolean;
    searchDelay?: number;
    onSearch: (value: string) => void;
    loading?: boolean;
    placeholder?: string;
    className?: string;
};

export const ListSearch: React.FC<ListSearchProps> = ({
    disabled,
    onSearch: handleSearch,
    className,
    loading,
    placeholder,
    searchDelay = 1000,
}) => {
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [search, setSearch] = React.useState('');

    const prevLoading = usePrevious(loading);

    React.useEffect(() => {
        if (!loading && prevLoading !== undefined && loading !== prevLoading) {
            searchInputRef.current?.focus?.();
        }
    }, [loading, prevLoading]);

    const debouncedSearch = React.useMemo(
        () =>
            debounce((value: string) => {
                handleSearch(value);
            }, searchDelay),
        [handleSearch, searchDelay],
    );

    React.useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const onSearch = React.useCallback(
        (value: string) => {
            setSearch(value);
            debouncedSearch(value);
        },
        [debouncedSearch],
    );

    return (
        <TextInput
            className={className}
            value={search}
            hasClear={true}
            onUpdate={onSearch}
            placeholder={placeholder}
            disabled={loading || disabled}
            controlRef={searchInputRef}
        />
    );
};
