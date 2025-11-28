import React from 'react';

import {ShieldCheck, ShieldKeyhole} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import type {GetSharedEntryResponse} from 'shared/schema';

import './SharedEntryIcon.scss';

type SharedEntryIconProps = {
    entry: GetSharedEntryResponse;
    className?: string;
};

const b = block('dl-shared-entry-icon');

export const SharedEntryIcon = ({entry, className}: SharedEntryIconProps) => {
    if (entry.isDelegated) {
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
