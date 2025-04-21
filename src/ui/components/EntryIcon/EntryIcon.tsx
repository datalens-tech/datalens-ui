import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import type {EntryScope} from 'shared';
import {ENTRY_TYPES} from 'shared';
import {getConnectorIconData} from 'ui/utils';

import {registry} from '../../registry';
import type {ConnectorIconViewProps} from '../ConnectorIcon/ConnectorIcon';
import {ConnectorIcon} from '../ConnectorIcon/ConnectorIcon';
import type {EntityIconSize, EntityIconType} from '../EntityIcon/EntityIcon';
import {EntityIcon, defaultIconSize} from '../EntityIcon/EntityIcon';

import iconFilesBroken from '../../assets/icons/broken.svg';

const entityTypeIcons: Record<string, string> = {
    script: 'editor',
    ...ENTRY_TYPES.ql.reduce((result, type) => {
        return {
            ...result,
            [type]: 'chart-ql',
        };
    }, {}),
    ...[...ENTRY_TYPES.legacyEditor, ...ENTRY_TYPES.editor].reduce((result, type) => {
        return {
            ...result,
            [type]: 'editor',
        };
    }, {}),
};

const folderIconSize = {
    s: 18,
    m: 20,
    l: 22,
    xl: 28,
};

interface EntryData {
    scope: string;
    type?: string;
}

export const getEntryIconData = ({type}: EntryData) => {
    let iconData: ConnectorIconViewProps['data'] | undefined;
    if (type) {
        const typeKey = type;
        const icon = getConnectorIconData(typeKey, true);
        if (icon) {
            iconData = icon;
        }
    }
    return iconData;
};

const getEntityIconType = (
    {scope, type}: EntryData,
    className?: string,
    entityIconSize?: EntityIconSize,
    overrideIconType?: EntityIconType,
) => {
    let iconType;

    if (type) {
        iconType = entityTypeIcons[type];
    }

    const {getScopeTypeIcon} = registry.common.functions.getAll();

    const entityIconType = overrideIconType || iconType || getScopeTypeIcon(scope as EntryScope);
    if (entityIconType) {
        const iconSize =
            entityIconType === 'folder'
                ? folderIconSize[entityIconSize || 's']
                : defaultIconSize[entityIconSize || 's'];
        return (
            <EntityIcon
                type={entityIconType as EntityIconType}
                iconSize={iconSize}
                size={entityIconSize}
                classMixin={className}
            />
        );
    }
    return null;
};

interface EntryIconProps extends Partial<ConnectorIconViewProps> {
    entry: EntryData;
    entityIconSize?: EntityIconSize;
    // can be used to use connection icon without type of connection
    overrideIconType?: EntityIconType;
}

export const EntryIcon = (props: EntryIconProps) => {
    const {entry, className, entityIconSize, overrideIconType, size, ...restProps} = props;
    const iconData = getEntryIconData(entry);
    const iconSize = size ?? defaultIconSize[entityIconSize || 's'];
    if (iconData) {
        return (
            <ConnectorIcon
                data={iconData}
                className={className}
                view="nav"
                size={iconSize}
                {...restProps}
            />
        );
    }
    return (
        getEntityIconType(entry, className, entityIconSize, overrideIconType) || (
            <Icon data={iconFilesBroken} className={className} size={iconSize} {...restProps} />
        )
    );
};
