import type {EntryDialoguesRef} from 'ui/components/EntryContextMenu/helpers';
import type {MenuEntry} from 'ui/components/EntryContextMenu/types';

export type SetEntryKey = (entryDialoguesRef: EntryDialoguesRef, entry: MenuEntry) => void;
