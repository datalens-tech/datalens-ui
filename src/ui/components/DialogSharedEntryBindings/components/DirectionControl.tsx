import React from 'react';

import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {AttachmentValue} from '../constants';
import {Attachment, DialogClassName} from '../constants';

type DirectionControlProps = {
    currentDirection: AttachmentValue;
    onUpdate: (direction: AttachmentValue) => void;
};

const i18n = I18n.keyset('component.dialog-shared-entry-bindings.view');
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
                {i18n('label-attachment-source')}
            </RadioButton.Option>
            <RadioButton.Option value={Attachment.TARGET}>
                {i18n('label-attachment-target')}
            </RadioButton.Option>
        </RadioButton>
    );
};
