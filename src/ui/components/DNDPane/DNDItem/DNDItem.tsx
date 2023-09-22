import flow from 'lodash/flow';
import {DragSource, DropTarget} from 'react-dnd';

const specSource = {
    beginDrag: (props: any) => ({sourceId: props.id}),
    endDrag(props: any, monitor: any) {
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
    drop(props: any) {
        return {targetId: props.id};
    },
};

function collectSource(connect: any, monitor: any) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

function collectTarget(connect: any, monitor: any) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    };
}

interface DNDItemProps {
    children: (props: any) => void;
}

function DNDItem(props: DNDItemProps) {
    return props.children(props);
}

export default flow(
    DropTarget('ITEM', specTarget, collectTarget), // eslint-disable-line new-cap
    DragSource('ITEM', specSource, collectSource), // eslint-disable-line new-cap
)(DNDItem);
