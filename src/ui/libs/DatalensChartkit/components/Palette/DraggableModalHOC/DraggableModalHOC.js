import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDrag} from 'react-dnd';

import {clamp} from '../../../helpers/helpers';

import './DraggableModalHOC.scss';

const b = block('draggable-modal');

export default function draggableModalHOC(Component) {
    return ({draggableModalTitle, draggableModalCloseHandler, ...props}) => {
        const elementRef = React.useRef(null);
        const [coords, setCoords] = React.useState({
            top: 0,
            right: 0,
        });

        const [{isDragging}, drag, preview] = useDrag({
            item: {type: 'draggable-modal'},
            end: (item, monitor) => {
                const delta = monitor.getDifferenceFromInitialOffset();
                const {width, height} = elementRef.current.getBoundingClientRect();

                const top = clamp(coords.top + delta.y, 0, window.innerHeight - height);
                const right = clamp(coords.right - delta.x, 0, window.innerWidth - width);

                setCoords({top, right});
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        const opacity = isDragging ? 0 : 1;

        return (
            <div ref={preview} className={b()} style={{...coords, opacity}}>
                <div ref={elementRef}>
                    <div ref={drag} className={b('draggable-node')}>
                        <div>{draggableModalTitle}</div>
                        <div className={b('close-icon')} onClick={draggableModalCloseHandler}>
                            <Icon data={Xmark} size={16} />
                        </div>
                    </div>
                    <Component {...props} />
                </div>
            </div>
        );
    };
}
