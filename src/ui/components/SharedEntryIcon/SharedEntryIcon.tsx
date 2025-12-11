import React from 'react';

import {ShieldCheck, ShieldKeyhole} from '@gravity-ui/icons';
import block from 'bem-cn-lite';

import './SharedEntryIcon.scss';

type SharedEntryIconProps = {
    isDelegated?: boolean;
    className?: string;
};

const b = block('dl-shared-entry-icon');

export const SharedEntryIcon = ({isDelegated, className}: SharedEntryIconProps) => {
    if (typeof isDelegated !== 'boolean') {
        return null;
    }
    if (isDelegated) {
        return (
            <div className={b(null, className)}>
                <ShieldCheck width={12} height={12} />
            </div>
        );
    } else {
        return (
            <div className={b(null, className)}>
                <ShieldKeyhole width={12} height={12} />
            </div>
        );
    }
};
