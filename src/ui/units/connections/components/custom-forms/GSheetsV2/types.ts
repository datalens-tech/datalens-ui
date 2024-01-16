import type {ListItemData} from '@gravity-ui/uikit';

import type {GSheetAddSectionState, GSheetItem} from '../../../store';

export type GSheetListItem = ListItemData<GSheetItem>;
export type AddGoogleSheet = (url: string) => void;
export type UpdateAddSectionState = (updates: Partial<GSheetAddSectionState>) => void;
export type HandleItemClick = (item: GSheetListItem) => void;
export type UpdateColumnFilter = (value: string) => void;
