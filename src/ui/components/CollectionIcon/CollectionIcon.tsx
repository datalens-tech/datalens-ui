import React from 'react';

import block from 'bem-cn-lite';

import {IconById} from '../IconById/IconById';

type CollectionIconType = {
    size?: number;
    isIconBig?: boolean;
};

import './CollectionIcon.scss';

const b = block('collection-icon');

const CollectionIcon: React.FC<CollectionIconType> = ({size = 32, isIconBig}) => {
    return (
        <IconById
            className={b()}
            id={isIconBig ? 'collectionColoredBig' : 'collectionColored'}
            size={size}
        />
    );
};

export {CollectionIcon};
