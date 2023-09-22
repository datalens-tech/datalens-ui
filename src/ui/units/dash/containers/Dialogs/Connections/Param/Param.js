import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import Context from '../Context/Context';

import './Param.scss';

const b = block('connections-param');

function Param({value}) {
    const {getParamTitle, getParamDataset} = React.useContext(Context);

    return (
        <span className={b()}>
            <span className={b('title', {dataset: Boolean(getParamDataset(value))})}>
                {getParamTitle(value)}
            </span>
            {getParamDataset(value) && (
                <span className={b('info')}>({getParamDataset(value)})</span>
            )}
        </span>
    );
}

Param.propTypes = {
    value: PropTypes.string.isRequired,
};

export default Param;
