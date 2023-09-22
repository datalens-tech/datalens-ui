import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import iconError from '../../../../../assets/icons/error-close.svg';

import './StackTrace.scss';

const b = block('stack-trace');

const StackTrace = ({stackTrace}) => {
    if (!stackTrace) {
        return null;
    }
    return (
        <div className={b()}>
            <div className={b('bg')} />
            <Icon data={iconError} size={20} className={b('error-icon')} />
            <pre className={b('text')}>{stackTrace}</pre>
        </div>
    );
};

StackTrace.propTypes = {
    stackTrace: PropTypes.string,
};

export default StackTrace;
