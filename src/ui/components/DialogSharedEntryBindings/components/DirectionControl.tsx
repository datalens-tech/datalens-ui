import React from 'react';

import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import type {AttachmentValue} from '../constants';
import {Attachment, DialogClassName} from '../constants';

type DirectionControlProps = {
    currentDirection: AttachmentValue;
    onUpdate: (direction: AttachmentValue) => void;
};

const b = block(DialogClassName);

export const DirectionControl = ({currentDirection, onUpdate}: DirectionControlProps) => {
    return (
        <RadioButton
            className={b('direction')}
            value={currentDirection}
            onUpdate={onUpdate}
            width="auto"
        >
            <RadioButton.Option value={Attachment.SOURCE}>
                {getSharedEntryMockText('label-attachment-target')}
            </RadioButton.Option>
            <RadioButton.Option value={Attachment.TARGET}>
                {getSharedEntryMockText('label-attachment-source')}
            </RadioButton.Option>
        </RadioButton>
    );
};
