import React from 'react';

import {BatchMove} from '../../../dialogs/BatchMove/BatchMove';
import type {BatchAction} from '../../../types';
import type {HookBatchSelectResult, TableViewProps} from '../types';

type Props = {
    action: BatchAction;
    onClose: () => void;
    selectedIds: HookBatchSelectResult['selectedIds'];
    entries: TableViewProps['entries'];
    refreshNavigation: TableViewProps['refreshNavigation'];
    onChangeLocation: TableViewProps['onChangeLocation'];
};

export const BatchDialog = ({
    action,
    onClose,
    entries,
    selectedIds,
    refreshNavigation,
    onChangeLocation,
}: Props) => {
    const selectedEntries = entries.filter((entry) => selectedIds.has(entry.entryId));

    switch (action) {
        case 'move':
            return (
                <BatchMove
                    onClose={onClose}
                    entries={selectedEntries}
                    refreshNavigation={refreshNavigation}
                    onChangeLocation={onChangeLocation}
                />
            );
        default:
            return null;
    }
};
