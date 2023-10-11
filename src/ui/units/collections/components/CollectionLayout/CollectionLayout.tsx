import React from 'react';

import block from 'bem-cn-lite';

import './CollectionLayout.scss';

const b = block('dl-collection-layout');

type Props = {
    title: string;
    description?: string | null;
    controls?: React.ReactNode;
    content: React.ReactNode;
    editBtn: React.ReactNode | null;
};

export const CollectionLayout = React.memo<Props>(
    ({title, description, controls, content, editBtn}) => {
        return (
            <div className={b()}>
                <div className={b('container')}>
                    <div className={b('title-content')}>
                        <h1 className={b('title')}>{title}</h1>
                        {editBtn}
                    </div>
                    {description && <div className={b('description')}>{description}</div>}
                    {controls && <div className={b('controls')}>{controls}</div>}
                    <div className={b('content')}>{content}</div>
                </div>
            </div>
        );
    },
);

CollectionLayout.displayName = 'CollectionLayout';
