import React from 'react';

import {Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {SharedScope} from 'shared';
import type {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';

import {ResourceInfo} from '../../ResourceInfo/ResourceInfo';

import './ActionPanel.scss';

const b = block('dl-iam-access-dialog-access-list-action-panel');

const i18n = I18n.keyset('component.iam-access-dialog');

export type Props = {
    type: ResourceType;
    title: string;
    resourceScope?: SharedScope;
    canUpdate: boolean;
    onAddUserClick: () => void;
    isLoadingDirect: boolean;
};

export const ActionPanel = ({
    type,
    title,
    canUpdate,
    onAddUserClick,
    isLoadingDirect,
    resourceScope,
}: Props) => {
    return (
        <div className={b()}>
            <div className={b('info')}>
                <ResourceInfo scope={resourceScope} type={type} title={title} />
            </div>
            <div className={b('add-button')}>
                <Button onClick={onAddUserClick} disabled={!canUpdate || isLoadingDirect}>
                    <Icon data={Plus} height={12} width={12} />
                    {i18n('action_add-user')}
                </Button>
            </div>
        </div>
    );
};
