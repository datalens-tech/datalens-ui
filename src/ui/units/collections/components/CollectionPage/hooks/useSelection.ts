import React from 'react';

import {useSelector} from 'react-redux';
import type {ValueOf} from 'shared';
import {CollectionItemEntities} from 'shared';

import {selectStructureItems} from '../../../store/selectors';
import {getIsWorkbookItem, getItemId} from '../../helpers';

type SelectionEntityType = ValueOf<typeof CollectionItemEntities>;

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
    const items = useSelector(selectStructureItems);

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

    const itemsWithDeletePermission = React.useMemo(
        () => items.filter((item) => item.permissions.delete),
        [items],
    );

    const itemsAvailableForSelection = React.useMemo(
        () => items.filter((item) => item.permissions.delete || item.permissions.move),
        [items],
    );

    const selectedMapWithMovePermission = React.useMemo(() => {
        const result: SelectedMap = {};

        Object.keys(selectedMap).forEach((entityId) => {
            const itemWithMovePermission = itemsWithMovePermission.find(
                (item) => getItemId(item) === entityId,
            );
            if (itemWithMovePermission) {
                result[entityId] = selectedMap[entityId];
            }
        });

        return result;
    }, [itemsWithMovePermission, selectedMap]);

    const selectedMapWithDeletePermission = React.useMemo(() => {
        const result: SelectedMap = {};

        Object.keys(selectedMap).forEach((entityId) => {
            const itemWithDeletePermission = itemsWithDeletePermission.find(
                (item) => getItemId(item) === entityId,
            );
            if (itemWithDeletePermission) {
                result[entityId] = selectedMap[entityId];
            }
        });

        return result;
    }, [itemsWithDeletePermission, selectedMap]);

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
            const itemHasPermission = Boolean(
                itemsAvailableForSelection.find((item) => entityId === getItemId(item)),
            );

            if (itemHasPermission) {
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
        [itemsAvailableForSelection, openSelectionMode, selectedMap],
    );

    const updateAllCheckboxes = React.useCallback(
        (checked: boolean) => {
            if (checked) {
                const newSelectedMap: SelectedMap = {};

                itemsAvailableForSelection.forEach((item) => {
                    const isWorkbook = getIsWorkbookItem(item);
                    const id = getItemId(item);
                    const type =
                        item.entity ||
                        (isWorkbook
                            ? CollectionItemEntities.WORKBOOK
                            : CollectionItemEntities.COLLECTION);

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
        [itemsAvailableForSelection, openSelectionMode, resetSelected],
    );

    React.useEffect(() => {
        const newSelectedMap: SelectedMap = {};

        const selectedMapKeys = Object.keys(selectedMap);

        selectedMapKeys.forEach((entityId) => {
            const entityInItems = items.find((item) => getItemId(item) === entityId);

            if (entityInItems) {
                newSelectedMap[entityId] = selectedMap[entityId];
            }
        });

        const newSelectedMapKeys = Object.keys(newSelectedMap);

        if (selectedMapKeys.length !== newSelectedMapKeys.length) {
            setSelectedMap(newSelectedMap);
            if (newSelectedMapKeys.length === 0) {
                closeSelectionMode();
            }
        }
    }, [items, selectedMap, closeSelectionMode]);

    React.useEffect(() => {
        closeSelectionMode();
        resetSelected();
    }, [curCollectionId, closeSelectionMode, resetSelected]);

    return {
        selectedMap,
        selectedMapWithMovePermission,
        selectedMapWithDeletePermission,
        itemsAvailableForSelection,
        isOpenSelectionMode,
        openSelectionMode,
        closeSelectionMode,
        resetSelected,
        updateCheckbox,
        updateAllCheckboxes,
    };
};
