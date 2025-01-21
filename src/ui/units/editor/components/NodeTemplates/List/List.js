import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';

import './List.scss';

const b = block('node-templates-list');

function Item({item, onClick}) {
    const {name} = item;
    return (
        <div className={b('item')} onClick={() => onClick(item)} data-qa={item.qa}>
            {i18n('editor.templates.view', `label_${name}`)}
            {item.version ? <span className={b('item-version')}>{item.version}</span> : null}
        </div>
    );
}

Item.propTypes = {
    item: PropTypes.object,
    onClick: PropTypes.func,
};

function List({items, onClick}) {
    return (
        <div className={b()} data-qa="node-templates-list">
            <div className={b('title')}>
                {i18n('editor.common.view', 'section_choose-template')}
            </div>
            {items.map((item) => {
                return <Item key={item.name} item={item} onClick={onClick} />;
            })}
        </div>
    );
}

List.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
        }).isRequired,
    ),
    onClick: PropTypes.func,
};

export default List;
