import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';

import type {ConnectorItem} from '../../../../../shared/schema';
import {getConnectorIconData, getConnectorIconDataWithoutDefault} from '../../../../utils';
import {getConnectorTitle} from '../../utils';

import {getConnectorListItemUrl} from './utils';

import './ConnectorsList.scss';

const b = block('conn-list');
const ICON_SIZE = 56;

type ListItemProps = {
    connector: ConnectorItem;
    workbookId?: string;
};

export const ListItem = ({connector, workbookId}: ListItemProps) => {
    const {conn_type: type, alias, title} = connector;
    const url = getConnectorListItemUrl({connector, workbookId});
    // This strange manipulation is needed in order to split two types of connection into 3 icons
    const iconData = getConnectorIconDataWithoutDefault(alias) || getConnectorIconData(type);

    return (
        <div className={b('item')}>
            <Link className={b('item-link')} to={url}>
                <Icon data={iconData} width={ICON_SIZE} height={ICON_SIZE} />
                <div className={b('item-title')}>{title || getConnectorTitle(type)}</div>
            </Link>
        </div>
    );
};
