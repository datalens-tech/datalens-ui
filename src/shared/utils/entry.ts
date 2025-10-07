import {ENTRY_TYPES} from '..';

export const isEditorEntryType = (type: string): type is (typeof ENTRY_TYPES.editor)[number] => {
    return (ENTRY_TYPES.editor as string[]).includes(type);
};

export const isLegacyEditorEntryType = (
    type: string,
): type is (typeof ENTRY_TYPES.legacyEditor)[number] => {
    return (ENTRY_TYPES.legacyEditor as string[]).includes(type);
};
