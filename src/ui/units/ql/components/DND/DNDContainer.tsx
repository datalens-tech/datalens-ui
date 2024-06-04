import React from 'react';

import update from 'immutability-helper';
import debounce from 'lodash/debounce';
import flow from 'lodash/flow';
import type {ConnectDropTarget, ConnectableElement, DropTargetMonitor} from 'react-dnd';
import {DropTarget} from 'react-dnd';
import type {QlConfigResultEntryMetadataDataColumnOrGroup} from 'shared/types/config/ql';

import DragAndDrop from '../../../../components/DragAndDrop/DragAndDrop';
import {getUniqueId} from '../../modules/helpers';

import DNDItem from './DNDItem';
import DNDLayer from './DNDLayer';

export interface DNDContainerProps {
    items: QlConfigResultEntryMetadataDataColumnOrGroup[];
    isOver?: boolean;
    item?: {
        item: QlConfigResultEntryMetadataDataColumnOrGroup;
    };
    id: string;
    itemsClassName: string;
    containerRef: React.Ref<HTMLElement>;
    connectDropTarget?: ConnectDropTarget;
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
    }) => ConnectableElement;
    onUpdate: (
        items: QlConfigResultEntryMetadataDataColumnOrGroup[],
        pushedItem:
            | QlConfigResultEntryMetadataDataColumnOrGroup
            | QlConfigResultEntryMetadataDataColumnOrGroup[]
            | null,
        event: string,
    ) => void;
}

export interface DNDContainerState {
    items: QlConfigResultEntryMetadataDataColumnOrGroup[];
    dropPlace?: number | null;
}

class DNDContainer extends React.PureComponent<DNDContainerProps, DNDContainerState> {
    setDropPlace = debounce((dropPlace) => {
        if (this.state.dropPlace !== dropPlace) {
            this.setState({
                dropPlace,
            });
        }
    }, 4);

    constructor(props: DNDContainerProps) {
        super(props);

        const items = props.items || [];

        this.state = {
            items,
            dropPlace: null,
        };
    }

    // eslint-disable-next-line
    componentWillReceiveProps(nextProps: DNDContainerProps) {
        if (this.state.items !== nextProps.items) {
            this.setState({items: nextProps.items});
        }
    }

    render() {
        const {items} = this.state;
        const {item: draggingItem, connectDropTarget} = this.props;

        return (
            connectDropTarget &&
            connectDropTarget(
                <div className="dnd-container">
                    {items.map((item, index) => {
                        return (
                            <DNDItem
                                key={index}
                                className={this.props.itemsClassName || ''}
                                item={item}
                                draggingItem={draggingItem}
                                index={index}
                                list={this}
                                listId={this.props.id}
                                remove={this.remove}
                                replace={this.replace}
                                move={this.move}
                                insert={this.insert}
                                dropPlace={this.state.dropPlace}
                                setDropPlace={this.setDropPlace}
                                wrapTo={this.props.wrapTo}
                            />
                        );
                    })}
                </div>,
            )
        );
    }

    push(item: QlConfigResultEntryMetadataDataColumnOrGroup) {
        const pushedItem = {...item};

        pushedItem.id = getUniqueId('inserted');

        this.setState(
            update(this.state, {
                items: {
                    $push: [pushedItem],
                },
            }),
        );

        if (this.props.onUpdate) {
            this.props.onUpdate(this.state.items, pushedItem, 'push');
        }
    }

    insert = async (item: QlConfigResultEntryMetadataDataColumnOrGroup, index: number) => {
        const insertedItem = {...item};

        insertedItem.id = getUniqueId('inserted');

        const newState = update(this.state, {
            items: {
                $splice: [[index, 0, insertedItem]],
            },
        });

        this.setState(newState);

        if (this.props.onUpdate) {
            this.props.onUpdate(newState.items, insertedItem, 'insert');
        }
    };

    replace = async (index: number, item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
        const newItem = item;

        this.setState(
            update(this.state, {
                items: {
                    $splice: [[index, 1, newItem]],
                },
            }),
        );

        const items = [...this.state.items];

        this.setState({items});

        if (this.props.onUpdate) {
            this.props.onUpdate(this.state.items, newItem, 'replace');
        }
    };

    swap(indexA: number, indexB: number) {
        const itemA = this.state.items[indexA];
        const itemB = this.state.items[indexB];

        const items = [...this.state.items];

        items[indexA] = itemB;
        items[indexB] = itemA;

        this.setState({
            items,
        });

        if (this.props.onUpdate) {
            this.props.onUpdate(this.state.items, [itemA, itemB], 'swap');
        }
    }

    remove = async (index: number) => {
        const removedItems = this.state.items.splice(index, 1);
        const items = [...this.state.items];

        this.setState({
            items,
        });

        if (this.props.onUpdate) {
            this.props.onUpdate(this.state.items, removedItems[0], 'remove');
        }
    };

    move = (dragIndex: number, hoverIndex: number) => {
        const {items} = this.state;
        const dragItem = items[dragIndex];

        this.setState(
            update(this.state, {
                items: {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, dragItem],
                    ],
                },
            }),
        );

        if (this.props.onUpdate) {
            this.props.onUpdate(this.state.items, null, 'move');
        }
    };
}

const itemTarget = {
    drop(props: {id: string}, _monitor: DropTargetMonitor, component: React.Component) {
        const {id} = props;

        return {
            listId: id,
            targetComponent: component,
        };
    },
};

const WrappedDNDContainer = flow(
    // eslint-disable-next-line
    DropTarget('ITEM', itemTarget, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        item: monitor.getItem(),
    })),
)(DNDContainer);

// eslint-disable-next-line
export default (props: DNDContainerProps) => (
    <DragAndDrop>
        <WrappedDNDContainer {...props} />
        <DNDLayer wrapTo={props.wrapTo} containerRef={props.containerRef} />
    </DragAndDrop>
);
