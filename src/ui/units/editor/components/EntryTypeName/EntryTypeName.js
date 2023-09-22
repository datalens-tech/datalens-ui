import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {getChartEditorTypes} from '../../configs/chart/chart-editor-types';

import './EntryTypeName.scss';

const b = block('entry-type-name');

function EntryTypeName({entry}) {
    const {type} = entry;
    if (!type) {
        return null;
    }
    const {name} = getChartEditorTypes(type);
    return <div className={b()}>{name}</div>;
}

EntryTypeName.propTypes = {
    entry: PropTypes.shape({
        type: PropTypes.string,
    }),
};

export default EntryTypeName;
