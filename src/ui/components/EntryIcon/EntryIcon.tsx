import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import type {EntryScope} from 'shared';
import {ENTRY_TYPES, Feature} from 'shared';
import Utils, {getConnectorIconData} from 'ui/utils';

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
    l: 22,
    xl: 28,
};

interface EntryData {
    scope: string;
    type?: string;
}

export const getEntryIconData = ({scope, type}: EntryData) => {
    let iconData: ConnectorIconViewProps['data'] | undefined;
    if (type) {
        let typeKey = type;
        if (scope === 'widget' && !Utils.isEnabledFeature(Feature.EntryMenuEditor)) {
            typeKey = '';
        }
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
) => {
    let iconType;

    if (type) {
        iconType = entityTypeIcons[type];
    }

    const {getScopeTypeIcon} = registry.common.functions.getAll();

    const entityIconType = iconType || getScopeTypeIcon(scope as EntryScope);
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
}

export const EntryIcon: React.FC<EntryIconProps> = (props) => {
    const {entry, className, entityIconSize, ...restProps} = props;
    const iconData = getEntryIconData(entry);
    if (iconData) {
        return <ConnectorIcon data={iconData} className={className} view="nav" {...restProps} />;
    }
    return (
        getEntityIconType(entry, className, entityIconSize) || (
            <Icon data={iconFilesBroken} className={className} {...restProps} />
        )
    );
};
