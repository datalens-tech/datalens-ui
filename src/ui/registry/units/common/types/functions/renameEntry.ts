import type {EntryDialoguesRef} from 'ui/components/EntryContextMenu/helpers';
import type {MenuEntry} from 'ui/components/EntryContextMenu/types';

export type RenameEntry = (entryDialoguesRef: EntryDialoguesRef, entry: MenuEntry) => void;
