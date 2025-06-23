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
    const selectionIndexPrev = React.useRef<number | null>(null);

    const allActiveIds = React.useMemo(() => {
        const ids = entries
            .filter((entry) => !entry.isLocked && !entry.workbookId)
            .map((entry) => entry.entryId);
        return new Set(ids);
    }, [entries]);

    const isAllCheckBoxChecked = React.useMemo(() => {
        return allActiveIds.size > 0 && [...allActiveIds].every((id) => selectedIds.has(id));
    }, [allActiveIds, selectedIds]);

    const resetSelectionAnchor = React.useCallback((indexAnchor: number | null = null) => {
        selectionIndexAnchor.current = indexAnchor;
        selectionIndexPrev.current = null;
    }, []);

    const onAllCheckBoxSelect = React.useCallback(() => {
        setSelectedIds(isAllCheckBoxChecked ? new Set() : new Set([...allActiveIds]));
        resetSelectionAnchor();
    }, [isAllCheckBoxChecked, allActiveIds]);

    const onEntrySelect = React.useCallback(
        (entryId: string, index: number) => {
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

                resetSelectionAnchor(index);
            }
        },
        [allActiveIds, selectedIds],
    );

    const resetSelected = React.useCallback(() => {
        setSelectedIds(new Set());
        resetSelectionAnchor();
    }, []);

    const onSelectByHotkey = React.useCallback(
        (entryId: string, index: number, modifier: {shiftKey: boolean}) => {
            if (!allActiveIds.has(entryId)) {
                return;
            }

            const newSelectedIds = new Set([...selectedIds]);

            const toggleRow = () => {
                selectionIndexAnchor.current = index;

                if (newSelectedIds.has(entryId)) {
                    newSelectedIds.delete(entryId);
                } else {
                    newSelectedIds.add(entryId);
                }

                setSelectedIds(newSelectedIds);
            };

            if (modifier.shiftKey) {
                if (selectionIndexAnchor.current === null) {
                    toggleRow();
                    return;
                }

                const start = Math.min(selectionIndexAnchor.current, index);
                const end = Math.max(selectionIndexAnchor.current, index);

                // deselect previos range
                if (selectionIndexPrev.current !== null) {
                    const prevStart = Math.min(selectionIndexPrev.current, index);
                    const prevEnd = Math.max(selectionIndexPrev.current, index);

                    for (let i = prevStart; i <= prevEnd; i++) {
                        newSelectedIds.delete(entries[i].entryId);
                    }
                }

                // select range from anchor to clicked row
                for (let i = start; i <= end; i++) {
                    if (allActiveIds.has(entries[i].entryId)) {
                        newSelectedIds.add(entries[i].entryId);
                    }
                }

                selectionIndexPrev.current = index;
                setSelectedIds(newSelectedIds);
            }
        },
        [allActiveIds, selectedIds],
    );

    return {
        selectedIds,
        isBatchEnabled,
        onEntrySelect,
        isAllCheckBoxChecked,
        onAllCheckBoxSelect,
        resetSelected,
        onSelectByHotkey,
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
