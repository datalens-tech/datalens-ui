import React from 'react';

import {debounce} from 'lodash';
import flow from 'lodash/flow';
import type {
    ConnectDragPreview,
    ConnectDragSource,
    ConnectDropTarget,
    ConnectableElement,
    DragSourceConnector,
    DragSourceMonitor,
    DropTargetMonitor,
} from 'react-dnd';
import {DragSource, DropTarget} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {findDOMNode} from 'react-dom';
import type {
    QlConfigResultEntryMetadataDataColumn,
    QlConfigResultEntryMetadataDataColumnOrGroup,
    QlConfigResultEntryMetadataDataGroup,
} from 'shared/types/config/ql';

import type {DNDContainerState} from './DNDContainer';

interface DNDItemProps {
    key: string;
    className: string;
    item: QlConfigResultEntryMetadataDataColumnOrGroup;
    draggingItem: QlConfigResultEntryMetadataDataColumnOrGroup;
    index: number;
    list: React.Component;
    listId: string;
    disabled: boolean;
    remove: (index: number) => void;
    replace: (index: number, item: QlConfigResultEntryMetadataDataColumnOrGroup) => void;
    move: () => void;
    insert: () => void;
    setDropPlace: (index: number | null) => void;
    wrapTo: (props: {
        isDragPreview?: boolean;
        item?: QlConfigResultEntryMetadataDataColumnOrGroup;
        index?: number;
        list?: React.Component;
    }) => ConnectableElement;
}

const itemSource = {
    canDrag(props: DNDItemProps) {
        const {undragable} = props.item as QlConfigResultEntryMetadataDataGroup;

        return !(undragable || props.disabled);
    },
    beginDrag(props: DNDItemProps) {
        return {
            className: 'is-dragging',
            index: props.index,
            listId: props.listId,
            item: props.item,
        };
    },
    endDrag(props: DNDItemProps, monitor: DragSourceMonitor) {
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const targetComponent: any = props.list;

        // dropPlace is the index of the place where the user is trying to insert
        // replacedItem === null, if the user is trying to attach some item,
        // without intending to insert between items
        const dropPlace = targetComponent.state.dropPlace;

        // Removing the dropPlace
        // Regardless of where the item was dropped
        targetComponent.setDropPlace(null);

        // Completed the tug-of-war don't understand where
        if (!dropResult) {
            return;
        }

        // Container state
        const state = targetComponent.state as DNDContainerState;

        const {hoveredItem} = item;

        // replacedItem - an item that we are trying to repaint
        // replacedItem === null if the user tries to insert between items,
        // not going to replay
        let replacedItem = null;
        if (typeof hoveredItem === 'number') {
            replacedItem = state.items[hoveredItem];
        }

        // We determine where the user still wants to reset the item:
        // to some place or still wants to re-place some item
        let targetIndex = state.items.length;
        if (replacedItem && (replacedItem as QlConfigResultEntryMetadataDataGroup).group) {
            targetIndex = item.hoverIndex + 1;
        } else if (typeof dropPlace === 'number') {
            targetIndex = dropPlace;
        } else if (typeof item.hoverIndex === 'number') {
            targetIndex = item.hoverIndex;
        }

        // We define the group into which the user wants to reset the item
        let targetGroup = state.items[0] as QlConfigResultEntryMetadataDataGroup;

        state.items.some((listItem, index: number) => {
            // We bring the type to the group
            const listGroup = listItem as QlConfigResultEntryMetadataDataGroup;

            // If we get to the right place, we go out
            if (index === targetIndex) {
                return true;
            }

            // If we meet a group, we record it in the target group.
            if (listGroup.group) {
                targetGroup = listGroup;
            }

            return false;
        });

        // We define the group from which the user wants to take the item
        let sourceGroup = state.items[0] as QlConfigResultEntryMetadataDataGroup;
        const sourceIndex = item.index;

        state.items.some((listItem, index: number) => {
            // We bring the type to the group
            const listGroup = listItem as QlConfigResultEntryMetadataDataGroup;

            // If we get to the right place, we go out
            if (index === sourceIndex) {
                return true;
            }

            // If we meet a group, we record it in the target group.
            if (listGroup.group) {
                sourceGroup = listGroup;
            }

            return false;
        });

        // If the target group cannot be reset for reasons,
        // that it is overflowing or the item does not fit the type,
        // then we go out
        if (
            !(replacedItem && !(replacedItem as QlConfigResultEntryMetadataDataGroup).group) &&
            targetGroup.capacity &&
            targetGroup.size === targetGroup.capacity
        ) {
            return;
        }

        if (state.items[item.hoveredItem] && state.items[item.hoveredItem].pseudo) {
            return;
        }

        // If the user still wants to apply,
        // then we replay and go out
        if (
            item.hoveredItem !== null &&
            !(replacedItem as QlConfigResultEntryMetadataDataGroup).group
        ) {
            item.hoveredItem = null;
            targetComponent.swap(item.hoverIndex, item.index);

            return;
        }

        // If the user wants to insert an item somewhere,
        // then we adjust the index depending on the current position
        if (item.index < targetIndex) {
            --targetIndex;
        }

        // Delete
        props.remove(item.index);

        // Insert
        dropResult.targetComponent.insert(item.item, targetIndex);

        if (typeof targetGroup.capacity === 'number') {
            --targetGroup.capacity;
        }

        if (typeof sourceGroup.capacity === 'number') {
            ++sourceGroup.capacity;
        }
    },
};

const itemTarget = {
    hover: debounce(
        (props: DNDItemProps, monitor: DropTargetMonitor, component: React.ReactInstance) => {
            const dragItem = monitor.getItem();

            if (!dragItem) {
                return;
            }

            const dragIndex = dragItem.index;
            const hoverIndex = props.index;

            // let's keep the index of the position where we have become confident
            dragItem.hoverIndex = hoverIndex;

            // eslint-disable-next-line
            const domNode = findDOMNode(component);

            // 100% is a div
            const hoverBoundingRect = (domNode as HTMLDivElement).getBoundingClientRect();

            const clientOffset = monitor.getClientOffset();

            if (clientOffset === null) {
                return;
            }

            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // Imagine a coordinate system in Euclidean space where the y-axis is pointing downwards (the x-axis is not important):
            // 0 is located where the upper edge of the element that we hit with the cursor while dragging something;
            // elementSize is located where the bottom edge of the same element is.
            // The zone that we consider a trigger for a replay is a zone the size of half an element from 1/4 of its height to 3/4 of its height
            const replaceZoneSize = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const replaceZoneBottom =
                hoverBoundingRect.bottom - replaceZoneSize / 2 - hoverBoundingRect.top;
            const replaceZoneTop = replaceZoneSize / 2;

            let dropPlace: number | null = null;

            if (hoverClientY < replaceZoneTop && hoverIndex > 0) {
                if (!(dragIndex === hoverIndex || dragIndex === hoverIndex - 1)) {
                    dropPlace = null;
                    dragItem.hoveredItem = null;
                    dragItem.replaceMode = false;
                }
            } else if (replaceZoneBottom < hoverClientY) {
                if (!(dragIndex === hoverIndex + 1 || dragIndex === hoverIndex)) {
                    dropPlace = hoverIndex + 1;
                    dragItem.hoveredItem = null;
                    dragItem.replaceMode = false;
                }
            } else if (dragIndex === hoverIndex) {
                dragItem.hoveredItem = null;
                dragItem.replaceMode = false;

                dropPlace = null;
            } else {
                dragItem.hoveredItem = hoverIndex;

                const targetItem = props.item as QlConfigResultEntryMetadataDataGroup;

                if (targetItem.group || targetItem.undragable) {
                    dragItem.replaceMode = false;
                    dropPlace = hoverIndex + 1;
                } else {
                    dragItem.replaceMode = true;
                    dropPlace = null;
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const container: any = props.list;

            if (typeof dropPlace === 'number') {
                const preDropPlace = dropPlace - 1;
                let targetGroup = container.props.items[0] as QlConfigResultEntryMetadataDataGroup;
                const targetItem = container.props.items[
                    preDropPlace
                ] as QlConfigResultEntryMetadataDataColumn;
                container.props.items.some(
                    (listItem: QlConfigResultEntryMetadataDataGroup, index: number) => {
                        const listGroup = listItem as QlConfigResultEntryMetadataDataGroup;

                        if (listGroup.group) {
                            targetGroup = listGroup as QlConfigResultEntryMetadataDataGroup;
                        }

                        if (index === preDropPlace) {
                            return true;
                        }

                        return false;
                    },
                );

                if (targetGroup.capacity && targetGroup.size === targetGroup.capacity) {
                    dropPlace = null;
                }

                if (targetItem.pseudo) {
                    dropPlace = null;
                }
            }

            props.setDropPlace(dropPlace);
        },
        4,
    ),
};

interface DNDItemProps {
    connectDragPreview: ConnectDragPreview;
    connectDragSource: ConnectDragSource;
    connectDropTarget: ConnectDropTarget;
    wrapTo: (props: {
        isDragPreview?: boolean;
        item?: QlConfigResultEntryMetadataDataColumnOrGroup;
        index?: number;
        list?: React.Component;
    }) => ConnectableElement;
}

interface DNDItemState {}

class DNDItem extends React.PureComponent<DNDItemProps, DNDItemState> {
    componentDidMount() {
        const {connectDragPreview} = this.props;
        if (connectDragPreview) {
            // Use empty image as a drag preview so browsers don't draw it
            // and we can draw whatever we want on the custom drag layer instead.
            connectDragPreview(getEmptyImage(), {
                // IE fallback: specify that we'd rather screenshot the node
                // when it already knows it's being dragged so we can hide it with CSS.
                captureDraggingState: true,
            });
        }
    }

    render() {
        const {connectDragSource, connectDropTarget} = this.props;

        return connectDragSource(connectDropTarget(this.props.wrapTo(this.props)));
    }
}

function collect(connect: DragSourceConnector, monitor: DragSourceMonitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

export default flow(
    // eslint-disable-next-line
    DropTarget('ITEM', itemTarget, (connect) => ({
        connectDropTarget: connect.dropTarget(),
    })),
    // eslint-disable-next-line
    DragSource('ITEM', itemSource, collect),
)(DNDItem);
