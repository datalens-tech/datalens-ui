import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import DNDItem from '../DNDItem/DNDItem';

import './DNDPane.scss';

const b = block('dnd-pane');

export default function DNDPane(props) {
    return (
        <DNDItem {...props}>
            {({
                connectDropTarget,
                connectDragSource,
                connectDragPreview,
                isDragging,
                isOver,
                canDrop,
            }) => {
                return connectDropTarget(
                    <div className={b()}>
                        <div className={b('content')}>
                            {connectDragPreview(<div className={b('preview')} />)}
                            {props.children(connectDragSource)}
                        </div>
                        {isDragging && <div className={b('dragging-effect')}></div>}
                        {!isDragging && isOver && canDrop && (
                            <div className={b('hover-effect')}></div>
                        )}
                    </div>,
                );
            }}
        </DNDItem>
    );
}

DNDPane.propTypes = {
    children: PropTypes.func.isRequired,
};
