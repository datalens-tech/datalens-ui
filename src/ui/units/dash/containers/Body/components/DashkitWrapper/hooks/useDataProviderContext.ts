import React from 'react';

import {useSelector} from 'react-redux';
import {DASH_INFO_HEADER} from 'shared';

import {selectCurrentTabId, selectEntryId} from '../../../../../store/selectors/dashTypedSelectors';

export const useDataProviderContext = (): {
    dataProviderContextGetter: () => Record<string, string>;
} => {
    const entryId = useSelector(selectEntryId);
    const tabId = useSelector(selectCurrentTabId);

    const dataProviderContextGetter = React.useCallback(() => {
        const dashInfo = {
            dashId: entryId || '',
            dashTabId: tabId || '',
        };

        return {
            [DASH_INFO_HEADER]: new URLSearchParams(dashInfo).toString(),
        };
    }, [entryId, tabId]);

    return {dataProviderContextGetter};
};
