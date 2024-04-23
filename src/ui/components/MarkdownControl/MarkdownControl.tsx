import React from 'react';

import {TextArea} from '@gravity-ui/uikit';

import {MarkdownControlProps} from '../../registry/units/common/types/components/MarkdownControl';

export const MarkdownControl = (props: MarkdownControlProps) => {
    const {value, onChange, disabled} = props;

    return <TextArea value={value} onUpdate={onChange} hasClear={true} disabled={disabled} />;
};
