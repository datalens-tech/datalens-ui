import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';

import './formControls.scss';

const b = block('user-info-form-controls');

type CustomRowProps = {
    label: string;
    children: React.ReactNode;
};

export const CustomRow = ({label, children}: CustomRowProps) => {
    return (
        <FormRow label={label} className={b('row')}>
            {children}
        </FormRow>
    );
};
