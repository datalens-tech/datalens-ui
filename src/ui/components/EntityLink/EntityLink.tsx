import React from 'react';

import block from 'bem-cn-lite';

import type {RowEntityData} from '../EntityRow/EntityRow';
import {EntityRow} from '../EntityRow/EntityRow';

import './EntityLink.scss';

type EntityLinkProps = {
    title?: string;
    entity: RowEntityData;
};

const b = block('entity-link');

export const EntityLink: React.FC<EntityLinkProps> = React.memo(({title, entity}) => {
    return (
        <div className={b()}>
            {title && <div className={b('title')}>{title}</div>}
            <EntityRow
                className={b('row')}
                entity={entity}
                showRelationButton={false}
                showRightSide={false}
            />
        </div>
    );
});
