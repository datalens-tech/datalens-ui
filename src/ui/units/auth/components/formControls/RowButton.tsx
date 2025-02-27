import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Button, type ButtonProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './formControls.scss';

const b = block('user-info-form-controls');

export const RowButton = (props: ButtonProps) => {
    return (
        <FormRow className={b('row')}>
            <Button {...props} />
        </FormRow>
    );
};
