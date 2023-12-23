import type {ListItemData} from '@gravity-ui/uikit';

import type {YadocItem, YadocsAddSectionState} from '../../../store';

export type YadocListItem = ListItemData<YadocItem>;
export type AddYandexDoc = (url: string) => void;
export type UpdateAddSectionState = (updates: Partial<YadocsAddSectionState>) => void;
export type HandleItemClick = (item: YadocListItem) => void;
