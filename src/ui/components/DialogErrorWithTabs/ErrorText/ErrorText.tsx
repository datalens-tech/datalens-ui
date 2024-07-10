import React from 'react';

import block from 'bem-cn-lite';
import {DL} from 'ui/constants/common';

import './ErrorText.scss';

const b = block('error-text');

type Props = {
    errorMessage: string;
    errorExtraDetails?: string;
};

const ErrorText: React.FC<Props> = ({errorMessage, errorExtraDetails}: Props) => {
    return (
        <div className={b('content', {mobile: DL.IS_MOBILE})}>
            {errorMessage}
            {Boolean(errorExtraDetails) && (
                <div className={b('extra-content')}>{errorExtraDetails}</div>
            )}
        </div>
    );
};

export default ErrorText;
