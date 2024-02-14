import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import templates from '../../../../../shared/constants/editor-templates';

import List from './List/List';

import './NodeTemplates.scss';

const b = block('node-templates');

function NodeTemplates({onClick}) {
    return (
        <div className={b()}>
            <List items={templates} onClick={onClick} />
        </div>
    );
}

NodeTemplates.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default NodeTemplates;
