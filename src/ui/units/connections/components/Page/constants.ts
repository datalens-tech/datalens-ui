import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';

export const HiddenContextsForSharedEntry = new Set<string>([
    ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES,
    ENTRY_CONTEXT_MENU_ACTION.DELETE,
    ENTRY_CONTEXT_MENU_ACTION.ACCESS,
    ENTRY_CONTEXT_MENU_ACTION.MOVE,
    ENTRY_CONTEXT_MENU_ACTION.MIGRATE_TO_WORKBOOK,
    ENTRY_CONTEXT_MENU_ACTION.COPY,
]);

export const HiddenContextsForWorkbookSharedEntry = new Set(HiddenContextsForSharedEntry).add(
    ENTRY_CONTEXT_MENU_ACTION.RENAME,
);
