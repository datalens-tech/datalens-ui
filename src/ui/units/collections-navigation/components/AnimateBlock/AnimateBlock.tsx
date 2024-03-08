import React from 'react';

import block from 'bem-cn-lite';
import {Waypoint} from 'react-waypoint';

import './AnimateBlock.scss';

const b = block('dl-animate-block');

export interface AnimateBlockProps {
    delay?: number;
    offset?: number;
    children?: React.ReactNode;
}

export const AnimateBlock = ({delay = 0, offset = 100, children}: AnimateBlockProps) => {
    const [playAnimation, setPlayAnimation] = React.useState<boolean>(false);

    return (
        <div className={b({animate: playAnimation})}>
            <Waypoint
                // trigger animation if element is above screen
                topOffset={'-100000%'}
                bottomOffset={offset}
                onEnter={async () => {
                    setTimeout(() => {
                        setPlayAnimation(true);
                    }, delay);
                }}
            />
            {children}
        </div>
    );
};
