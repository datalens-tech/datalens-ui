import React from 'react';

import type {CollectionContentFilters} from '../../../../../components/CollectionFilters';
import {CollectionFiltersStorage} from '../../../../../utils';
import {getUserDefaultFilters} from '../utils';

type UseViewModeArgs = {
    curCollectionId: string | null;
    closeSelectionMode: () => void;
    resetSelected: () => void;
};

export const useFilters = ({
    curCollectionId,
    closeSelectionMode,
    resetSelected,
}: UseViewModeArgs) => {
    const [filters, setFilters] = React.useState<CollectionContentFilters>(getUserDefaultFilters());

    const updateFilters = React.useCallback(
        (newFilters: CollectionContentFilters) => {
            closeSelectionMode();
            resetSelected();

            CollectionFiltersStorage.store(newFilters);
            setFilters(newFilters);
        },
        [closeSelectionMode, resetSelected],
    );

    React.useEffect(() => {
        updateFilters(getUserDefaultFilters());
    }, [curCollectionId, updateFilters]);

    return {
        filters,
        updateFilters,
    };
};
