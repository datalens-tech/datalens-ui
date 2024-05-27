import React from 'react';

import block from 'bem-cn-lite';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from 'ui/components/WorkbookIcon/WorkbookIcon';

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
    return (
        <div className={b('content-cell', {title: true})} key={collectionId}>
            <div className={b('title-col')}>
                <div className={b('title-col-icon')}>
                    {isWorkbook ? (
                        <WorkbookIcon title={title} size={'mobile'} />
                    ) : (
                        <CollectionIcon size={28} />
                    )}
                </div>
                <div className={b('title-col-text')}>{title}</div>
            </div>
        </div>
    );
};
