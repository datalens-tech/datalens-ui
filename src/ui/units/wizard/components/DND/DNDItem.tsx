import React, {Component} from 'react';

import flow from 'lodash/flow';
import {
    ConnectDragPreview,
    ConnectDragSource,
    ConnectDropTarget,
    ConnectableElement,
    DragSource,
    DragSourceConnector,
    DragSourceMonitor,
    DropTarget,
    DropTargetMonitor,
} from 'react-dnd';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Field} from 'shared';

import {AppDispatch} from '../../../../store';
import {PlaceholderAction, handleDnDItemUpdate} from '../../actions/dndItems';

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
interface DNDItemOwnProps {
    className: string;
    item: Field;
    draggingItem: Field;
    index: number;
    list: React.Component;
    listId: string;
    disabled: boolean;
    setDropPlace: (index: number | null) => void;
    wrapTo: (
        props: {
            isDragPreview?: boolean;
            item?: Field;
            index?: number;
            list?: React.Component;
        },
        component: React.Component,
    ) => ConnectableElement;
    listAllowedTypes?: Set<any>;
    listCheckAllowed?: (field: Field) => void;
    listNoRemove?: boolean;
    listOnItemClick?: ((event: any, field: Field) => void) | undefined;
    showHideLabel?: boolean;
    noSwap?: boolean;
    onAfterUpdate?: () => void;
    transform?: (item: Field, action?: 'replace') => Promise<Field>;
    onBeforeRemoveItem?: (item: Field) => Promise<void>;
    onRemoveItemClick?: (removeIndex: number) => Promise<void>;
}

interface DNDItemProps extends DNDItemOwnProps, DispatchProps {}

const itemSource = {
    canDrag(props: DNDItemProps) {
        const {undragable, disabled} = props.item;

        return !(undragable || props.disabled || disabled);
    },
    beginDrag(props: DNDItemProps) {
        return {
            className: 'is-dragging',
            index: props.index,
            listId: props.listId,
            listAllowedTypes: props.listAllowedTypes,
            listCheckAllowed: props.listCheckAllowed,
            listNoRemove: props.listNoRemove,
            item: props.item,
        };
    },
    endDrag(props: DNDItemProps, monitor: DragSourceMonitor) {
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();

        if (!dropResult) {
            return;
        }

        // If there is drag-n-drop without results - we roll back everything as it was
        if (dropResult.revert) {
            return;
        }

        const {targetComponent} = dropResult;
        const dropPlace = targetComponent.state.dropPlace;

        // ignoring the drop inside the container when dragging from the same container with the noSwap flag
        if (dropResult.listId === item.listId && targetComponent.props.noSwap) {
            return;
        }

        targetComponent.setDropPlace(null);

        if (targetComponent.doingReplace) {
            // reset the replacement flag
            targetComponent.doingReplace = false;

            // if we drop it into the same container
            if (dropResult.listId === item.listId) {
                if (!targetComponent.props.noSwap) {
                    props.actions.handleDnDItemUpdate({
                        currentSectionId: item.listId,
                        currentIndex: item.hoverIndex,
                        nextIndex: item.index,
                        action: 'swap-in-section',
                        onAfterUpdate: props.onAfterUpdate,
                        currentSectionAction: PlaceholderAction.Move,
                        field: item.item,
                    });
                }
            } else {
                // if we drop it into another container
                props.actions.handleDnDItemUpdate({
                    currentIndex: item.index,
                    nextIndex: item.hoverIndex,
                    currentSectionId: item.listId,
                    nextSectionId: dropResult.listId,
                    field: item.item,
                    action: 'replace-to-section',
                    nextSectionTransform: targetComponent.props.transform,
                    currentSectionTransform: props.transform,
                    onBeforeRemoveItem: props.onBeforeRemoveItem,
                    nextSectionOnBeforeRemoveItem: targetComponent.props.onBeforeRemoveItem,
                    onAfterUpdate: props.onAfterUpdate,
                    replaceOptions: {
                        listNoRemove: props.listNoRemove,
                        noRemove: targetComponent.props.noRemove,
                    },
                });
            }

            return;
        }

        let targetIndex =
            typeof dropPlace === 'number'
                ? dropPlace
                : typeof item.hoverIndex === 'number'
                  ? item.hoverIndex
                  : targetComponent.state.items.length;

        const isSameItemAndPosition =
            dropResult.listId === item.listId &&
            (targetIndex === item.index + 1 || targetIndex === item.index);

        if (isSameItemAndPosition) {
            return;
        }

        // If we insert an element into the same container, we first delete the element and cancel the call
        // onBeforeRemoveItem because the element will be inserted exactly.
        if (dropResult.listId === item.listId) {
            if (item.index < targetIndex) {
                targetIndex--;
            }
            props.actions.handleDnDItemUpdate({
                field: item.item,
                currentSectionId: item.listId,
                currentIndex: item.index,
                nextIndex: targetIndex,
                action: 'move-in-section',
                currentSectionAction: PlaceholderAction.Move,
                onAfterUpdate: props.onAfterUpdate,
                onBeforeRemoveItem: props.onBeforeRemoveItem,
                nextSectionTransform: dropResult.targetComponent.props.transform,
            });
            return;
        }

        props.actions.handleDnDItemUpdate({
            field: item.item,
            currentSectionId: item.listId,
            nextSectionId: dropResult.listId,
            currentIndex: item.index,
            nextIndex: targetIndex,
            action: 'move-to-section',
            currentSectionAction: PlaceholderAction.Remove,
            nextSectionAction: PlaceholderAction.Insert,
            onAfterUpdate: props.onAfterUpdate,
            onBeforeRemoveItem: props.onBeforeRemoveItem,
            nextSectionTransform: dropResult.targetComponent.props.transform,
        });
    },
};

const itemTarget = {
    hover(props: DNDItemProps, monitor: DropTargetMonitor, component: React.ReactInstance) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        const sourceListId = monitor.getItem().listId;

        // let's keep the index of the position where we have become confident
        monitor.getItem().hoverIndex = hoverIndex;

        // eslint-disable-next-line
        const domNode = findDOMNode(component);
        const hoverBoundingRect = (domNode as HTMLDivElement).getBoundingClientRect();

        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset === null ? 0 : clientOffset.y - hoverBoundingRect.top;

        // Imagine a coordinate system in Euclidean space where the y-axis is pointing downwards (the x-axis is not important):
        // 0 is located where the upper edge of the element that we hit with the cursor while dragging something;
        // elementSize is located where the bottom edge of the same element is.
        // The zone that we consider a trigger for a replay is a zone the size of half an element from 1/4 of its height to 3/4 of its height
        const replaceZoneSize = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const replaceZoneBottom =
            hoverBoundingRect.bottom - replaceZoneSize / 2 - hoverBoundingRect.top;
        const replaceZoneTop = replaceZoneSize / 2;

        if (hoverClientY < replaceZoneTop) {
            if (
                !(
                    props.listId === sourceListId &&
                    (dragIndex === hoverIndex || dragIndex === hoverIndex - 1)
                )
            ) {
                props.setDropPlace(hoverIndex);
            }
        } else if (replaceZoneBottom < hoverClientY) {
            if (
                !(
                    props.listId === sourceListId &&
                    (dragIndex === hoverIndex + 1 || dragIndex === hoverIndex)
                )
            ) {
                props.setDropPlace(hoverIndex + 1);
            }
        } else {
            props.setDropPlace(null);
        }
    },
};

interface DNDItemComponentProps extends DNDItemProps {
    connectDragPreview: ConnectDragPreview;
    connectDragSource: ConnectDragSource;
    connectDropTarget: ConnectDropTarget;
}

class DNDItem extends Component<DNDItemComponentProps> {
    constructor(props: DNDItemComponentProps) {
        super(props);

        this.state = {};
    }

    render() {
        const {connectDragSource, connectDropTarget, connectDragPreview} = this.props;

        const result = connectDragPreview(
            connectDragSource(connectDropTarget(this.props.wrapTo(this.props, this))),
            {
                captureDraggingState: false,
                offsetX: 0,
                offsetY: 0,
            },
        );

        return result;
    }
}

function collect(connect: DragSourceConnector, monitor: DragSourceMonitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
    return {
        actions: bindActionCreators(
            {
                handleDnDItemUpdate,
            },
            dispatch,
        ),
    };
};

export default connect<{}, DispatchProps, DNDItemOwnProps>(
    null,
    mapDispatchToProps,
)(
    flow(
        // eslint-disable-next-line
        DropTarget('ITEM', itemTarget, (connect) => ({
            connectDropTarget: connect.dropTarget(),
        })),
        // eslint-disable-next-line
        DragSource('ITEM', itemSource, collect),
    )(DNDItem),
);
