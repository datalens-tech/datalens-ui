import React from 'react';

import {COPIED_WIDGET_STORAGE_KEY} from '../../../../../../../constants';
import {useEffectOnce, useLocalStorageFallback} from '../../../../../../../hooks';
import type {CopiedConfigData} from '../../../../../modules/helpers';
import {getPastedWidgetData} from '../../../../../modules/helpers';

export const useCopiedData = (): {
    copiedData: CopiedConfigData | null;
    setCopiedDataToStore: (data: CopiedConfigData) => void;
} => {
    const [copiedData, setCopiedData] = React.useState<CopiedConfigData | null>(null);
    const {getItem: getCopiedDataWithStoreFallback, setItem: setCopiedDataToStore} =
        useLocalStorageFallback({
            key: COPIED_WIDGET_STORAGE_KEY,
            restoreFromLocalStorage: getPastedWidgetData,
        });

    const storageHandler = React.useCallback(() => {
        setCopiedData(getCopiedDataWithStoreFallback());
    }, [getCopiedDataWithStoreFallback]);

    useEffectOnce(() => {
        storageHandler();

        window.addEventListener('storage', storageHandler);

        return () => {
            window.removeEventListener('storage', storageHandler);
        };
    });

    return {copiedData, setCopiedDataToStore};
};
