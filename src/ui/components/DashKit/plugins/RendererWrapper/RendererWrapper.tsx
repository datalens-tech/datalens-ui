import React from 'react';

import block from 'bem-cn-lite';

import './RendererWrapper.scss';

const b = block('dashkit-plugin-container');

type RendererProps = {
    type: 'widget' | 'text' | 'title';
    nodeRef?: React.RefObject<HTMLDivElement>;
    classMod?: string;
    style?: React.StyleHTMLAttributes<HTMLDivElement>;
};

export const RendererWrapper: React.FC<RendererProps> = React.memo(
    ({children, type, nodeRef, classMod, ...props}) => (
        <div
            ref={nodeRef}
            className={b('wrapper', {[type]: Boolean(type), [String(classMod)]: Boolean(classMod)})}
            {...props}
        >
            {children}
        </div>
    ),
);

RendererWrapper.displayName = 'RendererWrapper';
