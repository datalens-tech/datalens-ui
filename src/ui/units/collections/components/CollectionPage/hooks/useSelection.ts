import React from 'react';

import {useSelector} from 'react-redux';

import {selectCollectionContentItems} from '../../../store/selectors';

export type SelectionEntityType = 'workbook' | 'collection';

export type SelectedMap = Record<string, SelectionEntityType>;

export type UpdateCheckboxArgs = {
    entityId: string;
    type: SelectionEntityType;
    checked: boolean;
};

type UseSelectionModeArgs = {
    curCollectionId: string | null;
};

export const useSelection = ({curCollectionId}: UseSelectionModeArgs) => {
    const items = useSelector(selectCollectionContentItems);

    const [selectedMap, setSelectedMap] = React.useState<SelectedMap>({});
    const [isOpenSelectionMode, setIsOpenSelectionMode] = React.useState(false);

    const openSelectionMode = React.useCallback(() => {
        setIsOpenSelectionMode(true);
    }, []);

    const closeSelectionMode = React.useCallback(() => {
        setIsOpenSelectionMode(false);
    }, []);

    const itemsWithMovePermission = React.useMemo(
        () => items.filter((item) => item.permissions.move),
        [items],
    );

    const itemsAvailableForSelection = [...itemsWithMovePermission];

    const selectedMapWithMovePermission = React.useMemo(() => {
        const result: SelectedMap = {};

        Object.keys(selectedMap).forEach((entityId) => {
            const itemWithMovePermission = itemsWithMovePermission.find(
                (item) => ('workbookId' in item ? item.workbookId : item.collectionId) === entityId,
            );
            if (itemWithMovePermission) {
                result[entityId] = selectedMap[entityId];
            }
        });

        return result;
    }, [itemsWithMovePermission, selectedMap]);

    const resetSelected = React.useCallback(() => {
        setSelectedMap({});
    }, []);

    const updateCheckbox = React.useCallback(
        ({
            entityId,
            type,
            checked,
        }: {
            entityId: string;
            type: SelectionEntityType;
            checked: boolean;
        }) => {
            const itemHasMovePermission = Boolean(
                itemsWithMovePermission.find(
                    (item) =>
                        entityId === ('workbookId' in item ? item.workbookId : item.collectionId),
                ),
            );

            if (itemHasMovePermission) {
                if (checked) {
                    openSelectionMode();
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
            }
        },
        [itemsWithMovePermission, openSelectionMode, selectedMap],
    );

    const updateAllCheckboxes = React.useCallback(
        (checked: boolean) => {
            if (checked) {
                const newSelectedMap: SelectedMap = {};

                itemsWithMovePermission.forEach((item) => {
                    const isWorkbook = 'workbookId' in item;
                    const id = isWorkbook ? item.workbookId : item.collectionId;
                    const type = isWorkbook ? 'workbook' : 'collection';

                    newSelectedMap[id] = type;
                });

                setSelectedMap({
                    ...newSelectedMap,
                });

                openSelectionMode();
            } else {
                resetSelected();
            }
        },
        [itemsWithMovePermission, openSelectionMode, resetSelected],
    );

    React.useEffect(() => {
        closeSelectionMode();
        resetSelected();
    }, [curCollectionId, closeSelectionMode, resetSelected]);

    return {
        selectedMap,
        selectedMapWithMovePermission,
        itemsAvailableForSelection,
        isOpenSelectionMode,
        openSelectionMode,
        closeSelectionMode,
        resetSelected,
        updateCheckbox,
        updateAllCheckboxes,
    };
};
