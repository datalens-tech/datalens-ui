import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionItemEntities, DialogCollectionStructureQa} from 'shared/constants';
import type {StructureItem} from 'shared/schema/us/types/collections';

import {IconById} from '../../../../../components/IconById/IconById';
import {EntryIcon} from '../../../../EntryIcon/EntryIcon';
import {WorkbookIcon} from '../../../../WorkbookIcon/WorkbookIcon';

import './Item.scss';

const b = block('dl-collections-structure-collection-select-item');

export type Props = {
    item: StructureItem;
    active: boolean;
    canSelectWorkbook: boolean;
    inactive: boolean;
    onSelect: (item: StructureItem) => void;
};

const ItemIcon = ({item}: Pick<Props, 'item'>) => {
    const theme = useThemeType();

    switch (item.entity) {
        case CollectionItemEntities.WORKBOOK:
            return <WorkbookIcon title={item.title} size="s" />;
        case CollectionItemEntities.COLLECTION:
            return (
                <IconById
                    id={theme === 'dark' ? 'collectionColoredDark' : 'collectionColored'}
                    size={20}
                />
            );
        case CollectionItemEntities.ENTRY:
            return (
                <EntryIcon
                    entry={item}
                    entityIconProps={{
                        classNameColorBox: 'custom-color-box',
                    }}
                    className={b('entry-icon')}
                />
            );
        default:
            return null;
    }
};

export const Item = React.memo<Props>(({item, active, canSelectWorkbook, inactive, onSelect}) => {
    const isWorkbook = item.entity === CollectionItemEntities.WORKBOOK;

    return (
        <div
            className={b({
                inactive: inactive || Boolean(isWorkbook && !canSelectWorkbook),
                active: Boolean(isWorkbook && canSelectWorkbook && active),
            })}
            onClick={() => {
                onSelect(item);
            }}
            data-qa={DialogCollectionStructureQa.ListItem}
        >
            <div className={b('icon')}>
                <ItemIcon item={item} />
            </div>
            <div className={b('title')}>{item.title}</div>
        </div>
    );
});

Item.displayName = 'Item';
