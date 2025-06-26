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

    const selectionIndexAnchor = React.useRef<number | null>(null);

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
        const newSelectedIds = isAllCheckBoxChecked
            ? new Set<string>()
            : new Set([...allActiveIds]);

        setSelectedIds(newSelectedIds);
        onItemSelect?.({
            selectedItemsIds: newSelectedIds,
        });
        selectionIndexAnchor.current = null;
    }, [isAllCheckBoxChecked, allActiveIds]);

    const onSelectByShiftKey = React.useCallback(
        (entryId: string, index: number, lastCheckedIndex: number) => {
            const newSelectedIds = new Set([...selectedIds]);

            const checked = !selectedIds.has(entryId);

            const start = Math.min(lastCheckedIndex, index);
            const end = Math.max(lastCheckedIndex, index);

            // select/deselect range from anchor to clicked row
            for (let i = start; i <= end; i++) {
                if (allActiveIds.has(entries[i].entryId)) {
                    if (checked) {
                        newSelectedIds.add(entries[i].entryId);
                    } else {
                        newSelectedIds.delete(entries[i].entryId);
                    }
                }
            }

            selectionIndexAnchor.current = index;
            setSelectedIds(newSelectedIds);

            onItemSelect?.({
                selectedItemId: entryId,
                selectedItemsIds: newSelectedIds,
            });
        },
        [allActiveIds, entries, selectedIds],
    );

    const onEntrySelect = React.useCallback(
        (entryId: string, index: number, {shiftKey}: {shiftKey: boolean}) => {
            if (allActiveIds.has(entryId)) {
                if (shiftKey && selectionIndexAnchor.current !== null) {
                    onSelectByShiftKey(entryId, index, selectionIndexAnchor.current);
                    return;
                }

                const newSelectedIds = new Set([...selectedIds]);
                if (selectedIds.has(entryId)) {
                    newSelectedIds.delete(entryId);
                } else {
                    newSelectedIds.add(entryId);
                }
                selectionIndexAnchor.current = index;

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
        selectionIndexAnchor.current = null;
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
