import type {ListItemData} from '@gravity-ui/uikit';

import type {YadocItem} from '../../../store';

export type YadocListItem = ListItemData<YadocItem>;
export type HandleItemClick = (item: YadocListItem) => void;
