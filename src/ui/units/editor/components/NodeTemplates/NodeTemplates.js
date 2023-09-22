import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {getSdk} from '../../../../libs/schematic-sdk';
import {MODULE_TYPE} from '../../constants/common';
import Fetch from '../Fetch/Fetch';

import List from './List/List';

import './NodeTemplates.scss';

const b = block('node-templates');

function formatter(result) {
    return result.entries.filter(({type}) => type.includes('_node') || type === MODULE_TYPE);
}

function NodeTemplates({onClick}) {
    return (
        <div className={b()}>
            <Fetch
                fetch={() => getSdk().us.listDirectory({path: 'TemplatesV2/'})}
                formatter={formatter}
            >
                {({data}) => <List items={data} onClick={onClick} />}
            </Fetch>
        </div>
    );
}

NodeTemplates.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default NodeTemplates;
