import React from 'react';

import PropTypes from 'prop-types';
import {useDrag, useDrop} from 'react-dnd';

import {DND_ITEM_TYPES} from '../../constants';

export function withDragging(Component) {
    function ComponentWithDragging(props) {
        const {avatar, dragDisabled, dropDisabled} = props;

        const [{isDragging}, drag] = useDrag({
            item: {
                type: DND_ITEM_TYPES.AVATAR,
                avatar,
                dropDisabled,
            },
            canDrag: () => !dragDisabled,
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        return <Component {...props} drag={drag} isDragging={isDragging} />;
    }

    ComponentWithDragging.propTypes = {
        ...Component.propTypes,
    };

    return ComponentWithDragging;
}

export function withDropping(Component) {
    function ComponentWithDropping(props) {
        const {onDrop, forwardedRef, avatar: dropAvatar, ...restProps} = props;

        const [{isOver}, drop] = useDrop({
            accept: DND_ITEM_TYPES.AVATAR,
            drop: (dragItem, monitor) => {
                const {avatar: dragAvatar} = dragItem;

                if (!monitor.didDrop()) {
                    onDrop(dropAvatar, dragAvatar, monitor);
                }
            },
            // canDrop does not have access to props, but can access the element described in useDrag
            canDrop: (dargItem) => !dargItem.dropDisabled,
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        });

        return (
            <Component
                {...restProps}
                onDrop={onDrop}
                avatar={dropAvatar}
                ref={forwardedRef}
                isOver={isOver}
                drop={drop}
            />
        );
    }

    ComponentWithDropping.propTypes = {
        ...Component.propTypes,
        onDrop: PropTypes.func.isRequired,
    };

    return ComponentWithDropping;
}

export function withDroppingOnSourceReplaceArea(Component) {
    function ComponentWithDropping(props) {
        const {onDrop, avatar, ...restProps} = props;

        const [{isOver}, drop] = useDrop({
            accept: DND_ITEM_TYPES.AVATAR,
            drop: (dragItem) => {
                const {avatar: source} = dragItem;

                onDrop(source, avatar);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        });

        return <Component {...restProps} isOver={isOver} drop={drop} />;
    }

    ComponentWithDropping.propTypes = {
        ...Component.propTypes,
    };

    return ComponentWithDropping;
}
