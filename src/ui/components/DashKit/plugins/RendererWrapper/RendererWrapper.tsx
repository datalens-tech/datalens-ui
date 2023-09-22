import React from 'react';

import block from 'bem-cn-lite';

import './RendererWrapper.scss';

const b = block('dashkit-plugin-container');

type RendererProps = {
    type: 'widget' | 'text';
};

export const RendererWrapper: React.FC<RendererProps> = React.memo(({children, type}) => (
    <div className={b('wrapper', {[type]: Boolean(type)})}>{children}</div>
));

RendererWrapper.displayName = 'RendererWrapper';
