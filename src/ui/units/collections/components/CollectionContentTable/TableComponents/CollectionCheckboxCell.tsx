import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionItemEntities} from 'shared';
import type {StructureItemWithPermissions} from 'shared/schema/types';

import type {SelectedMap, UpdateCheckboxArgs} from '../../CollectionPage/hooks/useSelection';
import {getIsWorkbookItem, getItemId} from '../../helpers';

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
    const type =
        item.entity ||
        (isWorkbook ? CollectionItemEntities.WORKBOOK : CollectionItemEntities.COLLECTION);

    const handleUpdate = (checked: boolean) => {
        onUpdateCheckboxClick({
            entityId: getItemId(item),
            type,
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
                checked={Boolean(selectedMap[getItemId(item)]) && canMoveItem}
            />
        </div>
    );
};
