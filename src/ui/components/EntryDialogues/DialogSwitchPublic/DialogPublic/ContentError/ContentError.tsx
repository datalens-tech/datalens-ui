import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ContentError.scss';

const b = block('dl-dialog-public-error');

type Props = {
    className?: string;
    buttonText: string;
    errorText: string;
    errorDescription?: string;
    onClick: () => void;
};

function ContentError({className, buttonText, errorText, errorDescription, onClick}: Props) {
    return (
        <div className={b(null, className)}>
            <div className={b('error-text')}>{errorText}</div>
            {errorDescription && <div className={b('error-text')}>{errorDescription}</div>}
            <Button view="action" size="l" onClick={onClick}>
                {buttonText}
            </Button>
        </div>
    );
}

export default ContentError;
