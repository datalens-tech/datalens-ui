import React from 'react';

import type {LoaderSize} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';

export const LocalUpdateLoader = ({
    show,
    hideDelay,
    className,
    size,
    qa,
    onLoaderShow,
}: {
    show: boolean;
    hideDelay: number;
    className?: string;
    size: LoaderSize;
    qa?: string;
    onLoaderShow?: () => void;
}) => {
    const [prevShow, setPrevShow] = React.useState(show);
    const [showByTimer, setShowByDelay] = React.useState(false);
    const [showByCondition, setShowByCondition] = React.useState(false);

    if (show !== prevShow) {
        setPrevShow(show);

        if (show) {
            onLoaderShow?.();
            setShowByCondition(true);
            setShowByDelay(true);

            if (hideDelay) {
                window.setTimeout(() => {
                    setShowByDelay(false);
                }, hideDelay);
            }
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
