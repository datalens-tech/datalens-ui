import React from 'react';

import type {LoaderSize} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';

export const LocalUpdateLoader = ({
    show,
    showDelay,
    hideDelay,
    className,
    size,
    qa,
}: {
    show: boolean;
    showDelay: number;
    hideDelay: number;
    className?: string;
    size: LoaderSize;
    qa?: string;
}) => {
    const hideTimer = React.useRef(0);
    const [prevShow, setPrevShow] = React.useState(show);
    const [showByTimer, setShowByDelay] = React.useState(false);
    const [showByCondition, setShowByCondition] = React.useState(false);

    if (show !== prevShow) {
        setPrevShow(show);

        if (show) {
            if (hideTimer) {
                window.clearTimeout(hideTimer.current);
            }
            hideTimer.current = window.setTimeout(() => {
                setShowByCondition(true);
                setShowByDelay(true);

                window.setTimeout(() => {
                    setShowByDelay(false);
                }, hideDelay);
            }, showDelay);
        }
    }

    if (!show && showByCondition) {
        setShowByCondition(false);
    }

    if (showByCondition || showByTimer) {
        return <Loader size={size} className={className} qa={qa} />;
    }
    return null;
};
