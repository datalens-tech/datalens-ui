import React from 'react';

import {
    CollectionPageViewMode,
    collectionPageViewModeStore,
} from '../../../../../components/CollectionFilters';
import Utils from '../../../../../utils';
import {getUserDefaultCollectionPageViewMode} from '../utils';

type UseViewModeArgs = {
    countSelected: number;
    setIsOpenSelectionMode: (value: boolean) => void;
};

export const useViewMode = ({countSelected, setIsOpenSelectionMode}: UseViewModeArgs) => {
    const [collectionPageViewMode, setCollectionPageViewMode] =
        React.useState<CollectionPageViewMode>(getUserDefaultCollectionPageViewMode());

    const onChangeCollectionPageViewMode = React.useCallback(
        (value: CollectionPageViewMode) => {
            Utils.store(collectionPageViewModeStore, value);
            setCollectionPageViewMode(value);

            if (value === CollectionPageViewMode.Grid && countSelected === 0) {
                setIsOpenSelectionMode(false);
            }
        },
        [countSelected, setIsOpenSelectionMode],
    );

    return {
        collectionPageViewMode,
        onChangeCollectionPageViewMode,
    };
};
