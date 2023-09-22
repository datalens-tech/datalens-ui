import React from 'react';

import block from 'bem-cn-lite';

import './CollectionLayout.scss';

const b = block('dl-collection-layout');

type Props = {
    title: string;
    description?: string | null;
    controls?: React.ReactNode;
    content: React.ReactNode;
};

export const CollectionLayout = React.memo<Props>(({title, description, controls, content}) => {
    return (
        <div className={b()}>
            <div className={b('container')}>
                <h1 className={b('title')}>{title}</h1>
                {description && <div className={b('description')}>{description}</div>}
                {controls && <div className={b('controls')}>{controls}</div>}
                <div className={b('content')}>{content}</div>
            </div>
        </div>
    );
});

CollectionLayout.displayName = 'CollectionLayout';
