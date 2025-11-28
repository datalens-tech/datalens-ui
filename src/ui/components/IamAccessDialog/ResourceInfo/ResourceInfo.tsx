import React from 'react';

import {Icon, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {SharedScope} from 'shared';
import {EntryIcon} from 'ui/components/EntryIcon/EntryIcon';
import {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';

import {IconById} from '../../IconById/IconById';

import workbookColoredIcon from '../../../assets/icons/collections/workbook-colored.svg';

import './ResourceInfo.scss';

const b = block('dl-iam-access-dialog-resource-info');

export type Props = {
    type: ResourceType;
    scope?: SharedScope;
    title: string;
};

const ResourceIcon = ({type, scope}: Omit<Props, 'title'>) => {
    const theme = useThemeType();

    switch (type) {
        case ResourceType.Collection:
            return (
                <IconById
                    id={theme === 'dark' ? 'collectionColoredDark' : 'collectionColored'}
                    size={20}
                />
            );
        case ResourceType.Workbook:
            return <Icon data={workbookColoredIcon} size={20} />;
        case ResourceType.SharedEntry:
            if (scope) {
                return (
                    <EntryIcon
                        entityIconProps={{
                            classNameColorBox: 'shared-entry-icon-box',
                        }}
                        entry={{scope: scope}}
                        overrideIconType={scope}
                    />
                );
            }
            return null;
    }
};

export const ResourceInfo = ({type, title, scope}: Props) => {
    return (
        <div className={b()}>
            <div className={b('icon')}>
                <ResourceIcon scope={scope} type={type} />
            </div>
            <div className={b('title')}>{title}</div>
        </div>
    );
};
