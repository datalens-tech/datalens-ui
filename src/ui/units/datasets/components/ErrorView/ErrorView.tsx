import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ErrorView.scss';

const b = block('error-view');

interface Props {
    errorMessage: string;
    actionBtnProps: {
        text: string;
        onClick: () => void;
    };
}

class ErrorView extends React.Component<Props> {
    render() {
        const {
            errorMessage,
            actionBtnProps: {text, onClick},
        } = this.props;

        return (
            <div className={b()}>
                <div className={b('error-message')}>
                    <span>{errorMessage}</span>
                </div>
                {Boolean(text && onClick) && <Button onClick={onClick}>{text}</Button>}
            </div>
        );
    }
}

export default ErrorView;
