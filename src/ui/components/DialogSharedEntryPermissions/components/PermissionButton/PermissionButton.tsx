import React from 'react';

import {CircleCheck, Lock} from '@gravity-ui/icons';
import {Card, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './PermissionButton.scss';

type PermissionButtonProps = {
    checked: boolean;
    disabled?: boolean;
    onCheck: () => void;
    icon: React.ReactNode;
    title: string;
    message: string;
};

const b = block('dl-permission-button');

export const PermissionButton: React.FC<PermissionButtonProps> = ({
    icon,
    checked,
    message,
    onCheck,
    title,
    disabled,
}) => {
    return (
        <Card
            className={b()}
            type="selection"
            selected={checked}
            view={disabled && !checked ? 'clear' : 'outlined'}
            onClick={disabled ? undefined : onCheck}
        >
            <div className={b('status-icon-container')}>
                {disabled && (
                    <Lock width={14} height={14} fill="currentColor" className={b('lock-icon')} />
                )}
                {checked && (
                    <CircleCheck
                        width={14}
                        height={14}
                        fill="currentColor"
                        className={b('check-icon')}
                    />
                )}
            </div>
            <div className={b('content-container', {disabled})}>
                {icon}
                <div className={b('content')}>
                    <Text variant="subheader-2">{title}</Text>
                    <Text variant="body-1" color="secondary">
                        {message}
                    </Text>
                </div>
            </div>
        </Card>
    );
};
