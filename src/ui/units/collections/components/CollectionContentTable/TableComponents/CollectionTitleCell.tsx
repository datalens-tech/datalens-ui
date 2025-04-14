import React from 'react';

import {Label, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {CollectionContentTableQa} from 'shared';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from 'ui/components/WorkbookIcon/WorkbookIcon';
import {DL} from 'ui/constants/common';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

const i18n = I18n.keyset('collections');

type CollectionTitleCellProps = {
    isWorkbook: boolean;
    collectionId: string | null;
    title: string;
    isImporting?: boolean;
};

export const CollectionTitleCell = ({
    isWorkbook,
    collectionId,
    title,
    isImporting,
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
                {isImporting && (
                    <Label theme="info" size="xs" className={spacing({ml: 2})}>
                        {i18n('label_status-importing')}
                    </Label>
                )}
            </div>
        </div>
    );
};
