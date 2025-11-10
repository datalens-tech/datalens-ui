import React from 'react';

import {TextArea} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {MarkdownControlProps} from '../../registry/units/common/types/components/MarkdownControl';

import './MarkdownControl.scss';

const b = block('markdown-control');

export const MarkdownControl = (props: MarkdownControlProps) => {
    const {value, onChange, disabled, className} = props;

    return (
        <TextArea
            className={b(null, className)}
            value={value}
            onUpdate={onChange}
            hasClear={true}
            disabled={disabled}
            controlProps={{className: b('textarea')}}
        />
    );
};
