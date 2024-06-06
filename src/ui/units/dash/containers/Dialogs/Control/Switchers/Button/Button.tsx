import React from 'react';

import {Button as CommonButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ControlQA} from 'shared';

import type {WrapperProps} from '../../Wrapper/Wrapper';
import Wrapper from '../../Wrapper/Wrapper';

import './Button.scss';

const b = block('control-switchers-button');

interface ButtonProps extends WrapperProps {
    text: string;
    disabled?: boolean;
    onClick: () => void;
    wrapButton?: boolean;
}

const Button: React.FunctionComponent<ButtonProps> = ({
    title,
    overflow,
    text,
    disabled,
    onClick,
    wrapButton = true,
}) => {
    const button = (
        <div className={b()}>
            <CommonButton
                view="outlined"
                size="m"
                disabled={disabled}
                onClick={onClick}
                className={b('btn')}
                qa={ControlQA.acceptableDialogButton}
                width="max"
            >
                {text}
            </CommonButton>
        </div>
    );

    if (!wrapButton) {
        return button;
    }

    return (
        <Wrapper title={title} overflow={overflow}>
            {button}
        </Wrapper>
    );
};

Button.defaultProps = {
    disabled: false,
};

export default Button;
