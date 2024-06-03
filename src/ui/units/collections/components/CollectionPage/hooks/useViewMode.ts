import React from 'react';

import {
    CollectionPageViewMode,
    collectionPageViewModeStore,
} from '../../../../../components/CollectionFilters';
import Utils from '../../../../../utils';
import {getUserDefaultCollectionPageViewMode} from '../utils';

import type {SelectedMap} from './useSelection';

type UseViewModeArgs = {
    selectedMap: SelectedMap;
    openSelectionMode: () => void;
    closeSelectionMode: () => void;
};

export const useViewMode = ({
    selectedMap,
    openSelectionMode,
    closeSelectionMode,
}: UseViewModeArgs) => {
    const [viewMode, setViewMode] = React.useState<CollectionPageViewMode>(
        getUserDefaultCollectionPageViewMode(),
    );

    const changeViewMode = React.useCallback(
        (value: CollectionPageViewMode) => {
            if (value === CollectionPageViewMode.Grid) {
                if (Object.keys(selectedMap).length > 0) {
                    openSelectionMode();
                } else {
                    closeSelectionMode();
                }
            } else {
                closeSelectionMode();
            }

            Utils.store(collectionPageViewModeStore, value);
            setViewMode(value);
        },
        [closeSelectionMode, openSelectionMode, selectedMap],
    );

    return {
        viewMode,
        changeViewMode,
    };
};
