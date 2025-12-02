import React from 'react';

import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {SharedScope} from 'shared';
import type {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';

import {ResourceInfo} from '../../ResourceInfo/ResourceInfo';
import {getResourceRoles} from '../../utils';

import './ActionPanel.scss';

const b = block('dl-iam-access-dialog-add-user-action-panel');

export type Props = {
    type: ResourceType;
    title: string;
    resourceScope?: SharedScope;
    options: {
        title: string;
        value: string;
    }[];
    role: string;
    onChangeRole: (role: string) => void;
};

export const ActionPanel = ({type, title, role, resourceScope, onChangeRole}: Props) => {
    const options = getResourceRoles(type);

    return (
        <div className={b()}>
            <div className={b('info')}>
                <ResourceInfo scope={resourceScope} type={type} title={title} />
            </div>
            <div className={b('change-role')}>
                <Select
                    value={[role]}
                    onUpdate={([newRole]) => {
                        onChangeRole(newRole);
                    }}
                    width="max"
                >
                    {options.map((option) => (
                        <Select.Option
                            key={option.value}
                            value={option.value}
                            content={option.title}
                        />
                    ))}
                </Select>
            </div>
        </div>
    );
};
