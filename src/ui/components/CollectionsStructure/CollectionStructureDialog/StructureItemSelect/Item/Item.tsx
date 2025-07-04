import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DialogCollectionStructureQa} from 'shared/constants';
import type {Collection} from 'shared/schema/us/types/collections';
import type {Workbook} from 'shared/schema/us/types/workbooks';

import {IconById} from '../../../../../components/IconById/IconById';
import {WorkbookIcon} from '../../../../WorkbookIcon/WorkbookIcon';

import './Item.scss';

const b = block('dl-collections-structure-collection-select-item');

export type Props = {
    item: Collection | Workbook;
    active: boolean;
    canSelectWorkbook: boolean;
    onSelect: (item: Collection | Workbook) => void;
};

export const Item = React.memo<Props>(({item, active, canSelectWorkbook, onSelect}) => {
    const theme = useThemeType();

    const isWorkbook = 'workbookId' in item;

    return (
        <div
            className={b({
                inactive: Boolean(isWorkbook && !canSelectWorkbook),
                active: Boolean(isWorkbook && canSelectWorkbook && active),
            })}
            onClick={() => {
                onSelect(item);
            }}
            data-qa={DialogCollectionStructureQa.ListItem}
        >
            <div className={b('icon')}>
                {isWorkbook ? (
                    <WorkbookIcon title={item.title} size="s" />
                ) : (
                    <IconById
                        id={theme === 'dark' ? 'collectionColoredDark' : 'collectionColored'}
                        size={20}
                    />
                )}
            </div>
            <div className={b('title')}>{item.title}</div>
        </div>
    );
});

Item.displayName = 'Item';
