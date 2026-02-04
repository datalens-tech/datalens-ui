import React from 'react';

import type {LabelProps} from '@gravity-ui/uikit';
import {Label, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {CollectionContentTableQa, CollectionItemEntities} from 'shared';
import type {StructureItemWithPermissions} from 'shared/schema';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';
import {EntryIcon} from 'ui/components/EntryIcon/EntryIcon';
import {WorkbookIcon} from 'ui/components/WorkbookIcon/WorkbookIcon';
import {DL} from 'ui/constants/common';

import type {WorkbookStatus} from '../../../../../../shared/constants/workbooks';
import {getIsWorkbookItem} from '../../helpers';
import {getItemParams} from '../helpers';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

const i18n = I18n.keyset('collections');

type CollectionTitleCellProps = {
    item: StructureItemWithPermissions;
};

const getLabelByStatus = (
    status: WorkbookStatus | null | undefined,
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

const ItemIcon = ({item}: CollectionTitleCellProps) => {
    const workbookSize = DL.IS_MOBILE ? 'mobile' : undefined;
    const collectionSize = DL.IS_MOBILE ? 28 : undefined;
    const entryIconSize = DL.IS_MOBILE ? 'l' : 'xl';

    switch (item.entity) {
        case CollectionItemEntities.COLLECTION:
            return <CollectionIcon size={collectionSize} />;
        case CollectionItemEntities.WORKBOOK:
            return <WorkbookIcon title={item.title} size={workbookSize} />;
        case CollectionItemEntities.ENTRY:
            return (
                <EntryIcon
                    entry={item}
                    entityIconSize={entryIconSize}
                    entityIconProps={{
                        classNameColorBox: 'custom-color-box',
                    }}
                    className={b('custom-entry-icon', {mobile: DL.IS_MOBILE})}
                />
            );
        default:
            return getIsWorkbookItem(item) ? (
                <WorkbookIcon title={item.title} size={workbookSize} />
            ) : (
                <CollectionIcon size={collectionSize} />
            );
    }
};

export const CollectionTitleCell = ({item}: CollectionTitleCellProps) => {
    // if it's not mobile set default size
    const {status} = getItemParams(item);
    const labelData = getLabelByStatus(status);

    return (
        <div
            className={b('content-cell', {title: true})}
            data-qa={CollectionContentTableQa.CollectionTitleCell}
        >
            <div className={b('title-col')}>
                <div>
                    <ItemIcon item={item} />
                </div>
                <div className={b('title-col-text')} title={item.title}>
                    {item.title}
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
