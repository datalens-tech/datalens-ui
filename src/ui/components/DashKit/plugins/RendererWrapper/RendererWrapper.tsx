import React from 'react';

import block from 'bem-cn-lite';

import {useWidgetContext} from '../../context/WidgetContext';

import './RendererWrapper.scss';

const b = block('dashkit-plugin-container');

type RendererProps = {
    id: string;
    type: 'widget' | 'text' | 'title';
    nodeRef?: React.RefObject<HTMLDivElement>;
    classMod?: string;
    style?: React.StyleHTMLAttributes<HTMLDivElement>;
};

export const RendererWrapper: React.FC<RendererProps> = React.memo(
    ({children, type, nodeRef, classMod, ...props}) => {
        const innerNodeRef = React.useRef(null);
        useWidgetContext(props.id, nodeRef || innerNodeRef);

        return (
            <div
                ref={nodeRef || innerNodeRef}
                className={b('wrapper', {
                    [type]: Boolean(type),
                    [String(classMod)]: Boolean(classMod),
                })}
                {...props}
            >
                {children}
            </div>
        );
    },
);

RendererWrapper.displayName = 'RendererWrapper';
