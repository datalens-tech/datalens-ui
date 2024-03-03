import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';

import type {
    CollectionWithPermissions,
    WorkbookWithPermissions,
} from '../../../../../../shared/schema';
import {selectCollectionContentItems} from '../../../store/selectors';
import {SelectedMap} from '../../types';

const i18n = I18n.keyset('collections');

export const useSelectionMode = () => {
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

    const onUpdateCheckbox = React.useCallback(
        (checked: boolean, type: 'workbook' | 'collection', entityId: string) => {
            if (checked) {
                setSelectedMap({
                    ...selectedMap,
                    [entityId]: {
                        type,
                        checked,
                    },
                });
            } else {
                const mapSelected = {...selectedMap};

                delete mapSelected[entityId];

                setSelectedMap({
                    ...mapSelected,
                });
            }

            if (checked && !isOpenSelectionMode) {
                setIsOpenSelectionMode(true);
            }
        },
        [isOpenSelectionMode, selectedMap],
    );

    const onSelectAll = React.useCallback(
        (checked: boolean) => {
            if (checked) {
                const selected: SelectedMap = {};

                itemsWithPermissionMove.forEach((item) => {
                    const isWorkbook = 'workbookId' in item;
                    const id = isWorkbook ? item.workbookId : item.collectionId;
                    const type = isWorkbook ? 'workbook' : 'collection';

                    selected[id] = {
                        type,
                        checked,
                    };
                });

                setSelectedMap({
                    ...selected,
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

    const onOpenSelectionMode = React.useCallback(() => {
        setIsOpenSelectionMode(true);
    }, []);

    const onCancelSelectionMode = React.useCallback(() => {
        setIsOpenSelectionMode(false);

        resetSelected();
    }, [resetSelected]);

    const selectBtn = React.useMemo(() => {
        if (countSelected === 0 && !isOpenSelectionMode) {
            return (
                <Button disabled={!canMove} view="outlined" onClick={onOpenSelectionMode}>
                    {i18n('action_select')}
                </Button>
            );
        }

        if (countSelected > 0) {
            return (
                <Button view="outlined" onClick={() => onSelectAll(false)}>
                    {i18n('action_reset-all')}
                </Button>
            );
        } else {
            return (
                <Button view="outlined" onClick={() => onSelectAll(true)}>
                    {i18n('action_select-all')}
                </Button>
            );
        }
    }, [countSelected, isOpenSelectionMode, canMove, onOpenSelectionMode, onSelectAll]);

    return {
        isOpenSelectionMode,
        selectedMap,
        setSelectedMap,
        countSelected,
        itemsWithPermissionMove,
        canMove,
        setIsOpenSelectionMode,
        resetSelected,
        onUpdateCheckbox,
        onSelectAll,
        onOpenSelectionMode,
        onCancelSelectionMode,
        selectBtn,
    };
};
