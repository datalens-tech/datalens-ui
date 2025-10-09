import React, {Component} from 'react';

import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ConnectDropTarget, ConnectableElement, DropTargetMonitor} from 'react-dnd';
import {DropTarget} from 'react-dnd';
import type {Field} from 'shared';

import DNDItem from './DNDItem';
import DragAndDrop from './DragAndDrop';

import filterItemInfo from 'ui/assets/icons/filter-tooltip.svg';

const b = block('dnd-container');

export interface DNDContainerProps {
    items: Field[];
    isOver?: boolean;
    item?: {
        item: Field;
    };
    id: string;
    itemsClassName?: string;
    connectDropTarget?: ConnectDropTarget;
    wrapTo: (props: any) => ConnectableElement;
    noRemove?: boolean;
    transform?: (item: Field, action?: 'replace') => Promise<Field>;
    onBeforeRemoveItem?: (item: Field) => Promise<void>;
    noSwap?: boolean;
    allowedTypes?: Set<any>;
    checkAllowed?: (field: Field) => boolean;
    onItemClick?: (event: any, field: Field) => void;
    allowedDataTypes?: Set<any>;
    capacity?: number;
    showHideLabel?: boolean;
    disabled?: boolean;
    onAfterUpdate?: () => void;
    onRemoveItemClick?: (removeIndex: number) => Promise<void>;
    title?: JSX.Element;
}

export interface DNDContainerState {
    items: Field[];
    dropPlace?: number | null;
}

class DNDContainer extends Component<DNDContainerProps, DNDContainerState> {
    constructor(props: DNDContainerProps) {
        super(props);

        const items = props.items || [];

        this.state = {
            items,
            dropPlace: 0,
        };
    }

    // eslint-disable-next-line
    componentWillReceiveProps(nextProps: DNDContainerProps) {
        if (this.state.items !== nextProps.items) {
            this.setState({items: nextProps.items, dropPlace: 0});
        }
    }
    setDropPlace = (dropPlace: number | null) => {
        if (this.state.dropPlace !== dropPlace) {
            this.setState({
                dropPlace,
            });
        }
    };

    render() {
        const {items} = this.state;
        let {dropPlace} = this.state;
        const {isOver, item: draggingItem, connectDropTarget, disabled} = this.props;

        let dropPlaceExists = false;
        let canDrop = false;

        if (draggingItem && draggingItem.item) {
            const itemDataType = draggingItem.item.data_type;

            dropPlaceExists = typeof dropPlace === 'number';

            if (isOver) {
                if (!dropPlaceExists && items.length === 0) {
                    dropPlaceExists = true;
                    dropPlace = 0;
                }
            } else {
                dropPlaceExists = false;
            }

            if (!this.props.allowedTypes && !this.props.checkAllowed) {
                canDrop = true;
            } else {
                canDrop =
                    (this.props.allowedTypes?.has(draggingItem.item.type) ?? true) &&
                    (this.props.checkAllowed?.(draggingItem.item) ?? true);
            }

            if (this.props.capacity && this.props.capacity <= this.state.items.length) {
                dropPlaceExists = false;
            }

            if (this.props.allowedDataTypes) {
                if (!this.props.allowedDataTypes.has(itemDataType)) {
                    canDrop = false;
                    dropPlaceExists = false;
                }
            }

            if (!canDrop) {
                dropPlaceExists = false;
            }
        }

        return connectDropTarget?.(
            <div
                data-qa="dnd-container"
                className={b({
                    'can-drop': canDrop,
                    'cannot-drop': !canDrop && isOver,
                })}
            >
                {this.props.title}
                {
                    <div
                        className="drop-place"
                        style={{
                            display: dropPlaceExists ? 'block' : 'none',
                            top: dropPlaceExists
                                ? dropPlace === 0
                                    ? -4
                                    : dropPlace! * 32 + 4 * (dropPlace! - 1) + 1
                                : 'auto',
                        }}
                    ></div>
                }
                {items.map((item, index) => {
                    const itemClassName = b('item', item.disabled ? {short: true} : {});
                    return (
                        <div className={itemClassName} key={`${item.id}-${index}`}>
                            <DNDItem
                                className={this.props.itemsClassName || ''}
                                item={item}
                                draggingItem={draggingItem as any}
                                index={index}
                                list={this}
                                transform={this.props.transform}
                                onBeforeRemoveItem={this.props.onBeforeRemoveItem}
                                onAfterUpdate={this.props.onAfterUpdate}
                                listId={this.props.id}
                                listAllowedTypes={this.props.allowedTypes}
                                listCheckAllowed={this.props.checkAllowed}
                                listOnItemClick={this.props.onItemClick}
                                listNoRemove={this.props.noRemove}
                                setDropPlace={this.setDropPlace}
                                wrapTo={this.props.wrapTo}
                                showHideLabel={this.props.showHideLabel}
                                noSwap={this.props.noSwap}
                                disabled={Boolean(disabled)}
                                onRemoveItemClick={this.props.onRemoveItemClick}
                            />
                            {item.disabled && (
                                <Popover
                                    content={item.disabled}
                                    placement="right"
                                    className={b('filter-tooltip')}
                                >
                                    <Icon data={filterItemInfo} fill="currentColor" />
                                </Popover>
                            )}
                        </div>
                    );
                })}
            </div>,
        );
    }
}

const itemTarget = {
    drop(
        props: DNDContainerProps,
        monitor: DropTargetMonitor,
        component: React.Component<DNDContainerProps, DNDContainerState> & {doingReplace: boolean},
    ) {
        const {id} = props;

        const sourceObj = monitor.getItem();
        const itemType = sourceObj.item.type;
        const itemDataType = sourceObj.item.data_type;

        if (id !== sourceObj.listId) {
            // cancel if it does not fit (but if replacement is not allowed)
            if (
                component.props.capacity &&
                component.props.capacity <= component.state.items.length &&
                !component.doingReplace
            ) {
                return {
                    revert: true,
                };
            }

            // cancel if it does not fit the type
            if (
                component.props.allowedTypes?.has(itemType) === false ||
                component.props.checkAllowed?.(sourceObj.item) === false
            ) {
                return {
                    revert: true,
                };
            }

            if (component.props.allowedDataTypes) {
                if (!component.props.allowedDataTypes.has(itemDataType)) {
                    return {
                        revert: true,
                    };
                }
            }
        }

        return {
            listId: id,
            targetComponent: component,
        };
    },
};

// eslint-disable-next-line
const WrappedDNDContainer = DropTarget('ITEM', itemTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    item: monitor.getItem(),
}))(DNDContainer);

// eslint-disable-next-line
export default (props: DNDContainerProps) => (
    <DragAndDrop>
        <WrappedDNDContainer {...props} />
    </DragAndDrop>
);
