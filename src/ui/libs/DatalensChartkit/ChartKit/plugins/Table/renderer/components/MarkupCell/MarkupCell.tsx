import React from 'react';

import {MarkupItem, TableCommonCell} from 'shared';
import {Markup} from 'ui/components/Markup';

type MarkupCellProps = {
    cell?: TableCommonCell;
};

export const MarkupCell = (props: MarkupCellProps) => {
    const {cell} = props;

    if (cell?.type !== 'markup') {
        return null;
    }

    return <Markup item={cell.value as MarkupItem} />;
};
