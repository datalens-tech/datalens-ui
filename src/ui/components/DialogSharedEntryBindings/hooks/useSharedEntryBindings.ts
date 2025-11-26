import React from 'react';

import debounce from 'lodash/debounce';
import type {SharedEntryBindingsItem} from 'shared/schema';
import {getSdk} from 'ui/libs/schematic-sdk';

import type {AttachmentValue} from '../constants';
import {Attachment, SEARCH_DELAY} from '../constants';
import type {SharedEntry} from '../types';
import {sortEntities} from '../utils';
type UseSharedEntryBindingsProps = {
    entry: SharedEntry;
};

const CONCURRENT_ID = 'shared-entry-bindings';
const cancelConcurrentRequest = () => getSdk().cancelRequest(CONCURRENT_ID);

export const useSharedEntryBindings = ({entry}: UseSharedEntryBindingsProps) => {
    const [entities, setEntities] = React.useState<SharedEntryBindingsItem[]>([]);

    const [currentDirection, setCurrentDirection] = React.useState<AttachmentValue>(
        Attachment.SOURCE,
    );
    const [searchFilter, setSearchFilter] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSearchLoading, setIsSearchLoading] = React.useState(false);
    const [isError, setIsError] = React.useState(false);

    const fetchEntityBindings = React.useCallback(
        (filter = '') => {
            setIsLoading(true);
            setIsError(false);
            cancelConcurrentRequest();
            getSdk()
                .sdk.us.getSharedEntryBindings({
                    entryId: entry.entryId,
                    entryAs: currentDirection,
                    filterString: filter ? filter : undefined,
                    mode: 'all',
                })
                .then((response) => {
                    setEntities(sortEntities(response.items));
                    setSearchFilter(filter);
                    setIsLoading(false);
                    setIsSearchLoading(false);
                })
                .catch((error) => {
                    if (error.isCancelled) {
                        return;
                    }
                    setIsError(true);
                    setIsLoading(false);
                    setIsSearchLoading(false);
                });
        },
        [entry, currentDirection],
    );

    const debouncedSearch = React.useMemo(
        () =>
            debounce((value: string) => {
                setIsSearchLoading(true);
                fetchEntityBindings(value);
            }, SEARCH_DELAY),
        [fetchEntityBindings],
    );

    const onSearch = React.useCallback(
        (value: string) => {
            setSearchFilter(value);
            debouncedSearch(value);
        },
        [debouncedSearch],
    );

    const onDirectionChange = (value: AttachmentValue) => {
        setCurrentDirection(value);
    };

    React.useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    React.useEffect(() => {
        setSearchFilter('');
        fetchEntityBindings();
    }, [fetchEntityBindings]);

    return {
        isError,
        isLoading,
        isSearchLoading,
        onSearch,
        searchValue: searchFilter,
        entities,
        onDirectionChange,
        currentDirection,
        fetchEntityBindings,
    };
};
