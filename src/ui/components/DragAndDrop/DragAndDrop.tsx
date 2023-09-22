import React, {useRef} from 'react';

import {DndProvider, createDndContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const Context = createDndContext(HTML5Backend);

interface DnDProps {
    children: React.ReactNode;
}

const useDNDProviderElement = (children: React.ReactNode): React.ReactNode => {
    const manager = useRef(Context);

    if (!children) {
        return null;
    }

    return <DndProvider manager={manager.current.dragDropManager}>{children}</DndProvider>;
};

const DragAndDrop: React.FC<DnDProps> = (props) => {
    const DNDElement = useDNDProviderElement(props.children);

    return <React.Fragment>{DNDElement}</React.Fragment>;
};

export default DragAndDrop;
