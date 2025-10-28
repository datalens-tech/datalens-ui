import React from 'react';

import {CollectionItemEntities} from 'shared';
import type {StructureItem} from 'shared/schema';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';
import {EntryIcon} from 'ui/components/EntryIcon/EntryIcon';
import {WorkbookIcon} from 'ui/components/WorkbookIcon/WorkbookIcon';

import {getIsWorkbookItem} from '../helpers';

type CollectionItemIconProps = {
    item: StructureItem;
};

export const CollectionItemIcon = ({item}: CollectionItemIconProps) => {
    switch (item.entity) {
        case CollectionItemEntities.COLLECTION:
            return <CollectionIcon isIconBig size={125} />;
        case CollectionItemEntities.WORKBOOK:
            return <WorkbookIcon title={item.title} size="l" />;
        case CollectionItemEntities.ENTRY:
            return (
                <EntryIcon
                    entry={item}
                    entityIconProps={{
                        classNameIcon: 'custom-icon',
                        classNameColorBox: 'custom-color-box',
                    }}
                    className="custom-entry-icon"
                />
            );
        default:
            return getIsWorkbookItem(item) ? (
                <WorkbookIcon title={item.title} size="l" />
            ) : (
                <CollectionIcon isIconBig size={125} />
            );
    }
};
