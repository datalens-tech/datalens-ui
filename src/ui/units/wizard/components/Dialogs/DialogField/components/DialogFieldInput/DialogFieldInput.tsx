import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

type Props = {
    qa: string;
    onUpdate?: (title: string) => void;
    value: string | undefined;
    disabled?: boolean;
};

const b = block('dialog-field-input');

export const DialogFieldInput: React.FC<Props> = (props: Props) => {
    const {value, qa, onUpdate, disabled} = props;
    return (
        <TextInput
            className={b()}
            pin="round-round"
            size="m"
            value={value}
            qa={qa}
            onUpdate={onUpdate}
            disabled={disabled}
        />
    );
};
