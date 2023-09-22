import flow from 'lodash/flow';
import {DragSource, DropTarget} from 'react-dnd';

const specSource = {
    beginDrag: (props) => ({sourceId: props.id}),
    endDrag(props, monitor) {
        const {id: sourceId, onDrop} = props;
        const dropResult = monitor.getDropResult();
        if (!dropResult) {
            return;
        }
        const {targetId} = dropResult;
        if (targetId && sourceId && sourceId !== targetId && onDrop) {
            onDrop({targetId, sourceId});
        }
    },
};

const specTarget = {
    drop(props) {
        return {targetId: props.id};
    },
};

function collectSource(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

function collectTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    };
}

function DNDItem(props) {
    return props.children(props);
}

export default flow(
    DropTarget('ITEM', specTarget, collectTarget), // eslint-disable-line new-cap
    DragSource('ITEM', specSource, collectSource), // eslint-disable-line new-cap
)(DNDItem);
