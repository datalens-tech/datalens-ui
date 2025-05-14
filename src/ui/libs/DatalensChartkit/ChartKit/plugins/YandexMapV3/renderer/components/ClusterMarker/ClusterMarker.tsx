import React from 'react';

import block from 'bem-cn-lite';

import './ClusterMarker.scss';

const b = block('ymap-cluster-marker');

type Props = {
    count: number;
};

export const ClusterMarker = (props: Props) => {
    const {count} = props;

    return (
        <div className={b()}>
            <div className={b('content')}>
                <span className={b('text')}>{count}</span>
            </div>
        </div>
    );
};
