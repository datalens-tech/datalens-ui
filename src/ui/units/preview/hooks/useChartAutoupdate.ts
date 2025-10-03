import React from 'react';

import {MIN_AUTOUPDATE_CHART_INTERVAL} from 'ui/constants/common';
import Utils from 'ui/utils';

export const useChartAutoupdate = () => {
    const [isPageHidden, setIsPageHidden] = React.useState(false);
    const [autoupdateInterval, setAutoupdateInterval] = React.useState<number | undefined>();

    const onVisibilityChange = React.useCallback(() => {
        setIsPageHidden(document.hidden);
    }, []);

    React.useEffect(() => {
        const {autoupdateInterval: updateInterval} = Utils.getOptionsFromSearch(
            window.location.search,
        );

        if (updateInterval) {
            setAutoupdateInterval(
                updateInterval >= MIN_AUTOUPDATE_CHART_INTERVAL
                    ? updateInterval
                    : MIN_AUTOUPDATE_CHART_INTERVAL,
            );
        }

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [onVisibilityChange]);

    return {
        isPageHidden,
        autoupdateInterval,
    };
};
