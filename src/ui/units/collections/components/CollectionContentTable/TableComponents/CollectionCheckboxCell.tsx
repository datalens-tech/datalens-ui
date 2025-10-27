import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionItemEntities} from 'shared';
import type {StructureItem} from 'shared/schema/types';

import type {SelectedMap, UpdateCheckboxArgs} from '../../CollectionPage/hooks/useSelection';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

type CollectionCheckboxCellProps = {
    item: StructureItem;
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
    const isWorkbook = item.entity === CollectionItemEntities.WORKBOOK;

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
