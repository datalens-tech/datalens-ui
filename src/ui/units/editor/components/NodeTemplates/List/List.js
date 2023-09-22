import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {EditorTemplatesQA} from 'shared/constants/qa/editor';

import {config} from '../config';

import './List.scss';

const b = block('node-templates-list');

function Item({item, onClick}) {
    const {text, path} = config.templates[item.name];
    return (
        <div className={b('item')} onClick={() => onClick(item, path)} data-qa={item.qa}>
            {text}
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
            <div
                className={b('item')}
                onClick={() => onClick({empty: true})}
                data-qa={EditorTemplatesQA.NoTemplate}
            >
                {i18n('editor.common.view', 'label_without-template')}
            </div>
            {items
                .filter((item) => item.name in config.templates)
                .map((item) => {
                    const itemWithQa = {
                        ...item,
                        qa: config.templates[item.name]?.qa,
                    };
                    return <Item key={item.entryId} item={itemWithQa} onClick={onClick} />;
                })}
        </div>
    );
}

List.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            entryId: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }).isRequired,
    ),
    onClick: PropTypes.func,
};

export default List;
