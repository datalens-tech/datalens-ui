import React from 'react';

import type {ButtonButtonProps} from '@gravity-ui/uikit';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import ShieldCheckIcon from '@gravity-ui/icons/svgs/shield-check.svg';
import ShieldExclamationIcon from '@gravity-ui/icons/svgs/shield-exclamation.svg';
import ShieldKeyholeIcon from '@gravity-ui/icons/svgs/shield-keyhole.svg';

import './SharedEntryIcon.scss';

type SharedEntryIconProps = {
    buttonProps?: ButtonButtonProps;
    isDelegated?: boolean | null;
    noBinding?: boolean;
    className?: string;
};

const b = block('dl-shared-entry-icon');

export const SharedEntryIcon = React.forwardRef<HTMLButtonElement, SharedEntryIconProps>(
    ({isDelegated, noBinding, className, buttonProps}, ref) => {
        let delegationIconData;

        if (noBinding) {
            delegationIconData = ShieldExclamationIcon;
        } else if (typeof isDelegated === 'boolean') {
            delegationIconData = isDelegated ? ShieldCheckIcon : ShieldKeyholeIcon;
        } else {
            return null;
        }

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
