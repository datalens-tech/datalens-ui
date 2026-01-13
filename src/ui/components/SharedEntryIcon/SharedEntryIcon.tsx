import React from 'react';

import type {ButtonButtonProps} from '@gravity-ui/uikit';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import ShieldCheckIcon from '@gravity-ui/icons/svgs/shield-check.svg';
import ShieldKeyholeIcon from '@gravity-ui/icons/svgs/shield-keyhole.svg';

import './SharedEntryIcon.scss';

type SharedEntryIconProps = {
    buttonProps?: ButtonButtonProps;
    isDelegated?: boolean;
    className?: string;
};

const b = block('dl-shared-entry-icon');

export const SharedEntryIcon = React.forwardRef<HTMLButtonElement, SharedEntryIconProps>(
    ({isDelegated, className, buttonProps}, ref) => {
        if (typeof isDelegated !== 'boolean') {
            return null;
        }
        const delegationIconData = isDelegated ? ShieldCheckIcon : ShieldKeyholeIcon;

        if (buttonProps) {
            return (
                <Button ref={ref} className={className} {...buttonProps}>
                    <Icon data={delegationIconData} width={12} height={12} />
                </Button>
            );
        }
        return (
            <div className={b(null, className)}>
                <Icon data={delegationIconData} width={12} height={12} />
            </div>
        );
    },
);
