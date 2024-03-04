import React from 'react';

import {CollectionContentFilters} from '../../../../../components/CollectionFilters';
import {SelectedMap} from '../../types';
import {getUserDefaultFilters} from '../utils';

type UseViewModeArgs = {
    setSelectedMap: (value: SelectedMap) => void;
};

export const useFilters = ({setSelectedMap}: UseViewModeArgs) => {
    const [filters, setFilters] = React.useState<CollectionContentFilters>(getUserDefaultFilters());

    const updateFilters = React.useCallback(
        (newFilters: CollectionContentFilters) => {
            setSelectedMap({});
            setFilters(newFilters);
        },
        [setSelectedMap],
    );

    return {
        filters,
        updateFilters,
    };
};
