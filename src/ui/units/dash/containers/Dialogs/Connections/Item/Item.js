import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {ITEM_TYPE} from '../../../../../../constants/dialogs';
import Context from '../Context/Context';

import iconAlert from 'ui/assets/icons/alert.svg';
import iconBarChart from 'ui/assets/icons/bar-chart.svg';
import iconControl from 'ui/assets/icons/control.svg';
import iconTable from 'ui/assets/icons/table.svg';

import './Item.scss';

const b = block('connections-item');

function Item({id, onClick}) {
    const {namespacedItems, metas} = React.useContext(Context);

    const {title, type: itemType} = namespacedItems.find(({id: itemId}) => itemId === id);
    const {type: metaType} = metas[id] || {};

    let icon;
    if (itemType === ITEM_TYPE.CONTROL || itemType === ITEM_TYPE.GROUP_CONTROL) {
        icon = iconControl;
    } else if (itemType === ITEM_TYPE.WIDGET && metaType) {
        icon = metaType === 'table' ? iconTable : iconBarChart;
    } else {
        icon = iconAlert;
    }

    if (typeof onClick === 'function') {
        return (
            <Button view="flat" size="m" width="auto" disabled={!metas[id]} onClick={onClick}>
                <Icon data={icon} size={24} className={b('icon')} />
                <span className={b('title')}>{title}</span>
            </Button>
        );
    }

    return (
        <span className={b()}>
            <Icon data={icon} size={24} className={b('icon')} />
            <span className={b('title')}>{title}</span>
        </span>
    );
}

Item.propTypes = {
    id: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

export default Item;
