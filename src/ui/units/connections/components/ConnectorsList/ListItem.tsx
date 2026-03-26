import React from 'react';

import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import type {ConnectorItem} from 'shared/schema/types';
import {ConnectorIcon} from 'ui/components/ConnectorIcon/ConnectorIcon';
import {getConnectorIconData, getConnectorIconDataByAlias} from 'ui/utils';

import {getConnectorTitle} from '../../utils';

import {getConnectorListItemUrl} from './utils';

import './ConnectorsList.scss';

const b = block('conn-list');
const ICON_SIZE = 56;

type ListItemProps = {
    connector: ConnectorItem;
    workbookId?: string;
    collectionId?: string;
};

export const ListItem: React.FC<ListItemProps> = ({connector, workbookId, collectionId}) => {
    const {conn_type: type, alias, title} = connector;

    const to = getConnectorListItemUrl({connector, workbookId, collectionId});
    const iconData = getConnectorIconDataByAlias(alias) || getConnectorIconData(type);
    const itemTitle = title || getConnectorTitle(type);

    return (
        <div className={b('item')}>
            <Link className={b('item-link')} to={to}>
                <ConnectorIcon data={iconData} height={ICON_SIZE} width={ICON_SIZE} />
                <div className={b('item-title')}>{itemTitle}</div>
            </Link>
        </div>
    );
};
