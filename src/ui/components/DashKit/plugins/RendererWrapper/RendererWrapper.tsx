import React from 'react';

import block from 'bem-cn-lite';

import './RendererWrapper.scss';

const b = block('dashkit-plugin-container');

type RendererProps = {
    type: 'widget' | 'text';
    nodeRef?: React.RefObject<HTMLDivElement>;
};

export const RendererWrapper: React.FC<RendererProps> = React.memo(({children, type, nodeRef}) => (
    <div ref={nodeRef} className={b('wrapper', {[type]: Boolean(type)})}>
        {children}
    </div>
));

RendererWrapper.displayName = 'RendererWrapper';
