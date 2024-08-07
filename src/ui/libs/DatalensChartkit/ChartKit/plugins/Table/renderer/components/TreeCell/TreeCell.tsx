import React from 'react';

import {Minus, Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {TableCommonCell} from 'shared';
import {ChartKitTreeNodeStateQa} from 'shared';

import './TreeCell.scss';

const b = block('tree-cell');

type TreeCellProps = {
    cell?: TableCommonCell;
};

export const TreeCell = (props: TreeCellProps) => {
    const {cell} = props;

    if (!cell?.treeNodeState) {
        return null;
    }

    const isOpened = cell.treeNodeState === 'open';
    const qa = isOpened ? ChartKitTreeNodeStateQa.Opened : ChartKitTreeNodeStateQa.Closed;
    const icon = isOpened ? Minus : Plus;

    return (
        <React.Fragment>
            <Button
                qa={qa}
                className={b('btn')}
                view="outlined"
                size="s"
                width="max"
                style={{marginLeft: 10 * (cell.treeOffset || 0)}}
            >
                <Icon data={icon} size={12} className={b('icon')} />
            </Button>
            {cell.formattedValue ?? cell.value}
        </React.Fragment>
    );
};
