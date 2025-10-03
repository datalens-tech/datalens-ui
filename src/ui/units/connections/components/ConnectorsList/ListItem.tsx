import React from 'react';

import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import type {CONNECTOR_VISIBILITY_MODE, ConnectorType, ValueOf} from 'shared';
import type {ConnectorItem} from 'shared/schema/types';
import {ConnectorIcon} from 'ui/components/ConnectorIcon/ConnectorIcon';
import {getConnectorIconData, getConnectorIconDataByAlias} from 'ui/utils';

import {getConnectorTitle} from '../../utils';

import {getConnectorListItemUrl} from './utils';

import './ConnectorsList.scss';

const b = block('conn-list');
const ICON_SIZE = 56;

interface RenderFnProps {
    data: {
        to: string;
        iconData: ReturnType<typeof getConnectorIconData>;
        title: string;
        type: ConnectorType;
        visibilityMode: ValueOf<typeof CONNECTOR_VISIBILITY_MODE>;
    };
    components: {
        ListItemWrapper: typeof ListItemWrapper;
        ListItemLink: typeof ListItemLink;
        ListItemIcon: typeof ListItemIcon;
        ListItemTitle: typeof ListItemTitle;
    };
}

export type RenderFn = (props: RenderFnProps) => React.ReactElement | null;

type ListItemProps = {
    connector: ConnectorItem;
    workbookId?: string;
    render: RenderFn;
};

const ListItemWrapper = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <div className={b('item', className)}>{children}</div>;
};

const ListItemLink = ({
    children,
    className,
    to,
}: {
    children: React.ReactNode;
    className?: string;
    to: string;
}) => {
    return (
        <Link className={b('item-link', className)} to={to}>
            {children}
        </Link>
    );
};

const ListItemIcon = ({iconData}: {iconData: ReturnType<typeof getConnectorIconData>}) => {
    return <ConnectorIcon data={iconData} height={ICON_SIZE} width={ICON_SIZE} />;
};

const ListItemTitle = ({title}: {title: string}) => {
    return <div className={b('item-title')}>{title}</div>;
};

export const ListItem: React.FC<ListItemProps> = ({connector, workbookId, render}) => {
    const {conn_type: type, alias, title, visibility_mode} = connector;
    const to = getConnectorListItemUrl({connector, workbookId});
    const iconData = getConnectorIconDataByAlias(alias) || getConnectorIconData(type);
    const itemTitle = title || getConnectorTitle(type);

    return render({
        data: {to, iconData, type, visibilityMode: visibility_mode, title: itemTitle},
        components: {
            ListItemWrapper,
            ListItemLink,
            ListItemIcon,
            ListItemTitle,
        },
    });
};
