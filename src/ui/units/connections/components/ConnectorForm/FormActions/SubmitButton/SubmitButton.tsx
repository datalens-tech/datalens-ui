import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Button} from '@gravity-ui/uikit';
import {ConnectionsBaseQA} from 'shared';

type SubmitButtonProps = ButtonProps & {text: string};

export const SubmitButton = (props: SubmitButtonProps) => {
    const {text, loading, disabled, onClick} = props;

    return (
        <Button
            qa={ConnectionsBaseQA.SUBMIT_ACTION_BUTTON}
            size="l"
            view="action"
            loading={loading}
            disabled={disabled}
            onClick={onClick}
        >
            {text}
        </Button>
    );
};
