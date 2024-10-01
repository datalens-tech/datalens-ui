import React from 'react';

import type {HookBatchSelectResult, TableViewProps} from './types';

type HookBatchSelectArgs = Pick<
    TableViewProps,
    'entries' | 'mode' | 'isMobileNavigation' | 'onItemSelect'
>;

export function useBatchSelect({
    entries,
    mode,
    isMobileNavigation,
    onItemSelect,
}: HookBatchSelectArgs): HookBatchSelectResult {
    const isBatchEnabled = checkBatchEnabled(mode, isMobileNavigation);

    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    const allActiveIds = React.useMemo(() => {
        const ids = entries
            .filter((entry) => !entry.isLocked && !entry.workbookId)
            .map((entry) => entry.entryId);
        return new Set(ids);
    }, [entries]);

    const isAllCheckBoxChecked = React.useMemo(() => {
        return allActiveIds.size > 0 && [...allActiveIds].every((id) => selectedIds.has(id));
    }, [allActiveIds, selectedIds]);

    const onAllCheckBoxSelect = React.useCallback(() => {
        setSelectedIds(isAllCheckBoxChecked ? new Set() : new Set([...allActiveIds]));
    }, [isAllCheckBoxChecked, allActiveIds]);

    const onEntrySelect = React.useCallback(
        (entryId: string) => {
            if (allActiveIds.has(entryId)) {
                const newSelectedIds = new Set([...selectedIds]);
                if (selectedIds.has(entryId)) {
                    newSelectedIds.delete(entryId);
                } else {
                    newSelectedIds.add(entryId);
                }

                setSelectedIds(newSelectedIds);

                if (onItemSelect) {
                    onItemSelect({
                        selectedItemId: entryId,
                        selectedItemsIds: newSelectedIds,
                    });
                }
            }
        },
        [allActiveIds, selectedIds],
    );

    const resetSelected = React.useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    return {
        selectedIds,
        isBatchEnabled,
        onEntrySelect,
        isAllCheckBoxChecked,
        onAllCheckBoxSelect,
        resetSelected,
    };
}

function checkBatchEnabled(
    mode: TableViewProps['mode'],
    isMobileNavigation: TableViewProps['isMobileNavigation'],
) {
    if (isMobileNavigation || mode === 'minimal') {
        return false;
    }
    return true;
}
