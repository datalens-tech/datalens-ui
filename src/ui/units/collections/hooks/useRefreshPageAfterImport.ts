import React from 'react';

import {useSelector} from 'react-redux';
import type {ProcessStatus} from 'shared/types/meta-manager';
import {selectGetImportProgressData} from 'ui/store/selectors/collectionsStructure';

type Args = {
    refreshPage: () => void;
};

export type RefreshPageAfterImport = (prevImportStatus: ProcessStatus | null) => void;

export const useRefreshPageAfterImport = ({
    refreshPage,
}: Args): {
    refreshPageAfterImport: RefreshPageAfterImport;
} => {
    const importProgressData = useSelector(selectGetImportProgressData);

    const importStatusRef = React.useRef(importProgressData?.status);
    React.useEffect(() => {
        importStatusRef.current = importProgressData?.status;
    }, [importProgressData]);

    const refreshPageAfterImport = React.useCallback(
        (prevImportStatus: ProcessStatus | null) => {
            if (importStatusRef.current !== prevImportStatus) {
                refreshPage();
            }
        },
        [importStatusRef, refreshPage],
    );

    return {
        refreshPageAfterImport,
    };
};
