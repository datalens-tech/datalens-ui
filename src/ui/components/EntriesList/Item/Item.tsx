import React from 'react';

import {Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import navigateHelper from 'libs/navigateHelper';
import {EntryScope} from 'shared';
import {registry} from 'ui/registry';
import Utils from 'utils';

import type {EntryItem} from '../types';

const b = block('dl-entries-list');

export type ItemProps<T extends EntryItem = EntryItem> = {
    item: T;
    itemIndex: number;
    renderAction?: (item: T, itemIndex: number) => React.ReactNode;
};

export const Item = <T extends EntryItem = EntryItem>({
    item,
    itemIndex,
    renderAction,
}: ItemProps<T>) => {
    const createdBy = item.createdBy;
    const name = item.name
        ? item.name
        : Utils.getEntryNameFromKey(item.key, item.scope === EntryScope.Folder);

    const {getLoginById} = registry.common.functions.getAll();
    const LoginById = getLoginById();

    const showLogin = LoginById && createdBy;

    return (
        <div className={b('item')}>
            <EntryIcon entry={item} className={b('item-icon')} size="24" />
            <div className={b('name')} title={name}>
                <Link
                    view="primary"
                    target="_blank"
                    href={navigateHelper.redirectUrlSwitcher(item)}
                >
                    {name}
                </Link>
            </div>
            {showLogin && (
                <div className={b('login')}>
                    <LoginById loginOrId={createdBy} view="secondary" />
                </div>
            )}
            <div className={b('action-place')}>{renderAction?.(item, itemIndex)}</div>
        </div>
    );
};
