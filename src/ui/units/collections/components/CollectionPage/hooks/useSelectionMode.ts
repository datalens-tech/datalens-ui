import React from 'react';

import {useSelector} from 'react-redux';

import type {
    CollectionWithPermissions,
    WorkbookWithPermissions,
} from '../../../../../../shared/schema';
import {selectCollectionContentItems} from '../../../store/selectors';
import {SelectedMap} from '../../types';

type UseSelectionModeArgs = {
    curCollectionId: string | null;
};

export const useSelectionMode = ({curCollectionId}: UseSelectionModeArgs) => {
    const [selectedMap, setSelectedMap] = React.useState<SelectedMap>({});
    const [isOpenSelectionMode, setIsOpenSelectionMode] = React.useState(false);

    const contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[] = useSelector(
        selectCollectionContentItems,
    );

    const countSelected = React.useMemo(() => {
        return Object.keys(selectedMap).length;
    }, [selectedMap]);

    const itemsWithPermissionMove = React.useMemo(
        () => contentItems.filter((item) => item.permissions.move),
        [contentItems],
    );

    const canMove = itemsWithPermissionMove.length > 0;

    const resetSelected = React.useCallback(() => {
        setSelectedMap({});
    }, []);

    const updateCheckbox = React.useCallback(
        (entityId: string, type: 'workbook' | 'collection', checked: boolean) => {
            if (checked) {
                setSelectedMap({
                    ...selectedMap,
                    [entityId]: type,
                });
            } else {
                const newSelectedMap = {...selectedMap};
                delete newSelectedMap[entityId];

                setSelectedMap({
                    ...newSelectedMap,
                });
            }

            if (checked && !isOpenSelectionMode) {
                setIsOpenSelectionMode(true);
            }
        },
        [isOpenSelectionMode, selectedMap],
    );

    const updateAllCheckboxes = React.useCallback(
        (checked: boolean) => {
            if (checked) {
                const newSelectedMap: SelectedMap = {};

                itemsWithPermissionMove.forEach((item) => {
                    const isWorkbook = 'workbookId' in item;
                    const id = isWorkbook ? item.workbookId : item.collectionId;
                    const type = isWorkbook ? 'workbook' : 'collection';

                    newSelectedMap[id] = type;
                });

                setSelectedMap({
                    ...newSelectedMap,
                });
            } else {
                resetSelected();
            }

            if (checked && !isOpenSelectionMode) {
                setIsOpenSelectionMode(true);
            }
        },
        [isOpenSelectionMode, itemsWithPermissionMove, resetSelected],
    );

    const openSelectionMode = React.useCallback(() => {
        setIsOpenSelectionMode(true);
    }, []);

    const closeSelectionMode = React.useCallback(() => {
        resetSelected();
        setIsOpenSelectionMode(false);
    }, [resetSelected]);

    React.useEffect(() => {
        closeSelectionMode();
    }, [curCollectionId, closeSelectionMode]);

    return {
        isOpenSelectionMode,
        selectedMap,
        setSelectedMap,
        countSelected,
        itemsWithPermissionMove,
        canMove,
        openSelectionMode,
        resetSelected,
        updateCheckbox,
        closeSelectionMode,
        setIsOpenSelectionMode,
        updateAllCheckboxes,
    };
};
