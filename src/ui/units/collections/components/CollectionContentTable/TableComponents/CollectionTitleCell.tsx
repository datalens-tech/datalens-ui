import React from 'react';

import block from 'bem-cn-lite';
import {CollectionContentTableQa} from 'shared';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from 'ui/components/WorkbookIcon/WorkbookIcon';
import {DL} from 'ui/constants/common';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

type CollectionTitleCellProps = {
    isWorkbook: boolean;
    collectionId: string | null;
    title: string;
};

export const CollectionTitleCell = ({
    isWorkbook,
    collectionId,
    title,
}: CollectionTitleCellProps) => {
    // if it's not mobile set default size
    const workbookSize = DL.IS_MOBILE ? 'mobile' : undefined;
    const collectionSize = DL.IS_MOBILE ? 28 : undefined;

    return (
        <div
            className={b('content-cell', {title: true})}
            key={collectionId}
            data-qa={CollectionContentTableQa.CollectionTitleCell}
        >
            <div className={b('title-col')}>
                <div>
                    {isWorkbook ? (
                        <WorkbookIcon title={title} size={workbookSize} />
                    ) : (
                        <CollectionIcon size={collectionSize} />
                    )}
                </div>
                <div className={b('title-col-text')} title={title}>
                    {title}
                </div>
            </div>
        </div>
    );
};
