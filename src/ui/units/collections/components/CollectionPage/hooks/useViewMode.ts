import React from 'react';

import {CollectionPageViewMode} from '../../../../../components/CollectionFilters';
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
