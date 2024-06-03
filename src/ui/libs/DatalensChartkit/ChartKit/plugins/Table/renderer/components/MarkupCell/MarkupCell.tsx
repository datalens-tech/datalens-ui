import React from 'react';

import type {MarkupItem, TableCommonCell} from 'shared';
import {Markup} from 'ui/components/Markup';

type MarkupCellProps = {
    cell?: TableCommonCell;
};

export const MarkupCell = (props: MarkupCellProps) => {
    const {cell} = props;

    return (
        <Markup
            item={cell?.value as MarkupItem}
            externalProps={{
                url: {
                    onClick: (event: React.SyntheticEvent) => {
                        // need to stop propagation for link components because it works incorrect with sorting by rows
                        // user click by link it leads to call both actions at the same time
                        // now clicking on the link will only open it without sorting table
                        event.stopPropagation();
                    },
                },
            }}
        />
    );
};
