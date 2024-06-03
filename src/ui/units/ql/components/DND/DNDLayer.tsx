import React from 'react';

import debounce from 'lodash/debounce';
import type {ConnectableElement} from 'react-dnd';
import {DragLayer} from 'react-dnd';
import type {QlConfigResultEntryMetadataDataColumnOrGroup} from 'shared/types/config/ql';

const getItemStyles = debounce(({initialOffset, currentOffset, containerRef}) => {
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none',
        };
    }

    const {y} = currentOffset;

    const transform = `translate(${initialOffset.x - 20}px, ${y}px)`;

    return {
        transform,
        width: containerRef.current.clientWidth,
    };
}, 2);

const DNDLayer = (props: {
    item: {item: QlConfigResultEntryMetadataDataColumnOrGroup};
    isDragging: boolean;
    initialOffset: {x: number; y: number} | null;
    currentOffset: {x: number; y: number} | null;
    containerRef: React.Ref<unknown>;
    wrapTo: (props: {
        item: QlConfigResultEntryMetadataDataColumnOrGroup;
        index?: number;
        list?: {
            props: {
                items: QlConfigResultEntryMetadataDataColumnOrGroup[];
            };
            state: {
                dropPlace: number;
            };
        };
        isDragPreview?: boolean;
        draggedItem: {};
    }) => ConnectableElement;
}) => {
    if (!props.isDragging) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 100,
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                opacity: 0.7,
            }}
        >
            <div style={getItemStyles(props)}>
                {props.wrapTo({
                    item: props.item.item,
                    draggedItem: props.item,
                    isDragPreview: true,
                })}
            </div>
        </div>
    );
};

// eslint-disable-next-line
export default DragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
}))(DNDLayer);
