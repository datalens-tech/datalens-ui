import React from 'react';

import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import {CONNECTOR_VISIBILITY_MODE} from 'shared';
import type {ConnectorItem} from 'shared/schema/types';
import {ConnectorIcon} from 'ui/components/ConnectorIcon/ConnectorIcon';
import {registry} from 'ui/registry';
import {getConnectorIconData, getConnectorIconDataByAlias} from 'ui/utils';

import {getConnectorTitle} from '../../utils';

import {getConnectorListItemUrl} from './utils';

import './ConnectorsList.scss';

const b = block('conn-list');
const ICON_SIZE = 56;

type ListItemProps = {
    connector: ConnectorItem;
    workbookId?: string;
};

interface ItemLinkProps {
    isLink: boolean;
    to: string;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}

const ItemLink = (props: ItemLinkProps) => {
    const {isLink, to, ...rest} = props;
    return isLink ? <Link to={to} {...rest} /> : <button {...rest} />;
};

export const ListItem = ({connector, workbookId}: ListItemProps) => {
    const ref = React.useRef<{onClick: () => void}>(null);
    const {conn_type: type, alias, title} = connector;
    const url = getConnectorListItemUrl({connector, workbookId});
    const iconData = getConnectorIconDataByAlias(alias) || getConnectorIconData(type);

    const {BusinessConnectionLabel} = registry.connections.components.getAll();
    const {getIsShowBusinessConnectionLabel} = registry.connections.functions.getAll();

    const isShowBusinessConnectionLabel =
        connector.visibility_mode === CONNECTOR_VISIBILITY_MODE.BUSINESS &&
        getIsShowBusinessConnectionLabel();

    const onClick = () => {
        ref.current?.onClick?.();
    };

    return (
        <div className={b('item')}>
            <ItemLink
                className={b('item-link')}
                to={url}
                onClick={onClick}
                isLink={!isShowBusinessConnectionLabel}
            >
                <ConnectorIcon data={iconData} height={ICON_SIZE} width={ICON_SIZE} />
                <div className={b('item-title')}>{title || getConnectorTitle(type)}</div>
                {isShowBusinessConnectionLabel && (
                    <BusinessConnectionLabel type={type} onClickRef={ref} />
                )}
            </ItemLink>
        </div>
    );
};
