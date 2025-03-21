import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema/types';

import type {SelectedMap, UpdateCheckboxArgs} from '../../CollectionPage/hooks/useSelection';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

type CollectionCheckboxCellProps = {
    item: WorkbookWithPermissions | CollectionWithPermissions;
    selectedMap: SelectedMap;
    onUpdateCheckboxClick: (args: UpdateCheckboxArgs) => void;
};

export const CollectionCheckboxCell = ({
    item,
    selectedMap,
    onUpdateCheckboxClick,
}: CollectionCheckboxCellProps) => {
    const canMoveItem = item.permissions.move;

    const handleUpdate = (checked: boolean) => {
        const isWorkbook = 'workbookId' in item;
        onUpdateCheckboxClick({
            entityId: isWorkbook ? item.workbookId : item.collectionId,
            type: isWorkbook ? 'workbook' : 'collection',
            checked,
        });
    };

    const onCheckboxContainerClick = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (!canMoveItem) return;
            if (event.target === event.currentTarget) {
                event.preventDefault();
            }
            event.stopPropagation();
        },
        [canMoveItem],
    );

    return (
        <div
            className={b('content-cell', {
                disabled: !canMoveItem,
            })}
            onClick={onCheckboxContainerClick}
        >
            <Checkbox
                size="l"
                onUpdate={handleUpdate}
                disabled={!canMoveItem}
                checked={
                    Boolean(
                        selectedMap['workbookId' in item ? item.workbookId : item.collectionId],
                    ) && canMoveItem
                }
            />
        </div>
    );
};
