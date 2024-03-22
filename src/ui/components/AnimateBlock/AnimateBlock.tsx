import React from 'react';

import block from 'bem-cn-lite';
import {Waypoint} from 'react-waypoint';

import './AnimateBlock.scss';

const b = block('dl-animate-block');

export interface AnimateBlockProps {
    className?: string;
    delay?: number;
    offset?: number;
    children?: React.ReactNode;
}

export const AnimateBlock = ({className, delay = 0, offset = 100, children}: AnimateBlockProps) => {
    const [isScheduledAnimation, setIsScheduledAnimation] = React.useState(false);
    const [isPlayedAnimation, setIsPlayedAnimation] = React.useState(false);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isScheduledAnimation) {
            timer = setTimeout(() => {
                setIsPlayedAnimation(true);
            }, delay);
        }

        return () => {
            if (isScheduledAnimation && timer) {
                clearTimeout(timer);
            }
        };
    }, [delay, isScheduledAnimation]);

    return (
        <div className={b({animate: isPlayedAnimation}, className)}>
            <Waypoint
                // trigger animation if element is above screen
                topOffset={'-100000%'}
                bottomOffset={offset}
                onEnter={() => {
                    setIsScheduledAnimation(true);
                }}
            />
            {children}
        </div>
    );
};
