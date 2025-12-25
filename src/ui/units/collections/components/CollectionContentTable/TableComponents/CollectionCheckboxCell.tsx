import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {StructureItemWithPermissions} from 'shared/schema/types';

import type {SelectedMap, UpdateCheckboxArgs} from '../../CollectionPage/hooks/useSelection';
import {getIsWorkbookItem} from '../../helpers';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

type CollectionCheckboxCellProps = {
    item: StructureItemWithPermissions;
    selectedMap: SelectedMap;
    onUpdateCheckboxClick: (args: UpdateCheckboxArgs) => void;
    disabled?: boolean;
};

export const CollectionCheckboxCell = ({
    item,
    selectedMap,
    onUpdateCheckboxClick,
    disabled,
}: CollectionCheckboxCellProps) => {
    const canMoveItem = item.permissions.move;
    const isDisabled = !canMoveItem || disabled;
    const isWorkbook = getIsWorkbookItem(item);

    const handleUpdate = (checked: boolean) => {
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
                disabled: isDisabled,
            })}
            onClick={onCheckboxContainerClick}
        >
            <Checkbox
                size="l"
                onUpdate={handleUpdate}
                disabled={isDisabled}
                checked={
                    Boolean(selectedMap[isWorkbook ? item.workbookId : item.collectionId]) &&
                    canMoveItem
                }
            />
        </div>
    );
};
