import React from 'react';

import {CollectionContentFilters} from '../../../../../components/CollectionFilters';
import {CollectionFiltersStorage} from '../../../../../utils';
import {SelectedMap} from '../../types';
import {getUserDefaultFilters} from '../utils';

type UseViewModeArgs = {
    curCollectionId: string | null;
    setSelectedMap: (value: SelectedMap) => void;
};

export const useFilters = ({curCollectionId, setSelectedMap}: UseViewModeArgs) => {
    const [filters, setFilters] = React.useState<CollectionContentFilters>(getUserDefaultFilters());

    const updateFilters = React.useCallback(
        (newFilters: CollectionContentFilters) => {
            setSelectedMap({});
            CollectionFiltersStorage.store(newFilters);
            setFilters(newFilters);
        },
        [setSelectedMap],
    );

    React.useEffect(() => {
        updateFilters(getUserDefaultFilters());
    }, [curCollectionId, updateFilters]);

    return {
        filters,
        updateFilters,
    };
};
