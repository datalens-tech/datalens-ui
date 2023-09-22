import type {ListItemData} from '@gravity-ui/uikit';

import type {GSheetAddSectionState, GSheetEditableSource, GSheetItem} from '../../../store';

export type GSheetListItem = ListItemData<GSheetItem>;
export type SourceSchema = GSheetEditableSource['data']['source']['raw_schema'];
export type SourcePreview = GSheetEditableSource['data']['source']['preview'];
export type AddGoogleSheet = (url: string) => void;
export type UpdateAddSectionState = (updates: Partial<GSheetAddSectionState>) => void;
export type HandleItemClick = (item: GSheetListItem) => void;
export type UpdateColumnFilter = (value: string) => void;
