import React from 'react';

import type {LabelProps} from '@gravity-ui/uikit';
import {Label, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {CollectionContentTableQa} from 'shared';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from 'ui/components/WorkbookIcon/WorkbookIcon';
import {DL} from 'ui/constants/common';

import type {WorkbookStatus} from '../../../../../../shared/constants/workbooks';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

const i18n = I18n.keyset('collections');

type CollectionTitleCellProps = {
    isWorkbook: boolean;
    collectionId: string | null;
    title: string;
    status?: WorkbookStatus | null;
};

const getLabelByStatus = (
    status: CollectionTitleCellProps['status'],
): {label: string; theme: LabelProps['theme']} | null => {
    switch (status) {
        case 'deleting':
            return {label: i18n('label_status-deleting'), theme: 'normal'};
        case 'creating':
            return {label: i18n('label_status-importing'), theme: 'info'};
        default:
            return null;
    }
};

export const CollectionTitleCell = ({
    isWorkbook,
    collectionId,
    title,
    status,
}: CollectionTitleCellProps) => {
    // if it's not mobile set default size
    const workbookSize = DL.IS_MOBILE ? 'mobile' : undefined;
    const collectionSize = DL.IS_MOBILE ? 28 : undefined;

    const labelData = getLabelByStatus(status);

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
                {labelData?.label && (
                    <Label theme={labelData.theme} size="xs" className={spacing({ml: 2})}>
                        {labelData.label}
                    </Label>
                )}
            </div>
        </div>
    );
};
