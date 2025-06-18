import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ListItemActions} from './ListItemActions';
import type {ListItemProps} from './types';

import fileItemIcon from '../../../../assets/icons/file-item.svg';

import './ListItem.scss';

const b = block('conn-list-item');
const ICON_SIZE = 16;

export const ListItem = <T extends unknown>(props: ListItemProps<T>) => {
    const {title, description, actions, qa} = props;

    return (
        <div className={b()} data-qa={qa}>
            <Icon className={b('icon')} data={fileItemIcon} size={ICON_SIZE} />
            <div className={b('container')}>
                <div className={b('title')}>
                    <span className={b('title-value')} title={title}>
                        {title}
                    </span>
                    {actions && <ListItemActions actions={actions} />}
                </div>
                {description && <div className={b('description')}>{description}</div>}
            </div>
        </div>
    );
};
