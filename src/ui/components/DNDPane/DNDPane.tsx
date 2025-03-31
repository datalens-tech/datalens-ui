import React from 'react';

import block from 'bem-cn-lite';
import type {ConnectDragPreview, ConnectDragSource, ConnectDropTarget} from 'react-dnd';

import DNDItem from './DNDItem/DNDItem';

import './DNDPane.scss';

const b = block('dnd-pane');

interface DNDPaneProps {
    children: (connectDragSource: any) => void;
    id: string;
    onDrop?: (value: {sourceId: string; targetId: string}) => void;
}

interface DNDPaneWrapperProps {
    connectDropTarget: ConnectDropTarget;
    connectDragSource: ConnectDragSource;
    connectDragPreview: ConnectDragPreview;
    isDragging: any;
    isOver: any;
    canDrop: any;
}

class DNDPane extends React.PureComponent<DNDPaneProps> {
    render() {
        return (
            <DNDItem {...this.props}>
                {({
                    connectDropTarget,
                    connectDragSource,
                    connectDragPreview,
                    isDragging,
                    isOver,
                    canDrop,
                }: DNDPaneWrapperProps) => {
                    return connectDropTarget(
                        <div className={b()}>
                            <div className={b('content')}>
                                {connectDragPreview(<div className={b('preview')} />)}
                                {this.props.children(connectDragSource)}
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
}

export default DNDPane;
