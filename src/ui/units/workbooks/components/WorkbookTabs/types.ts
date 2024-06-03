import type {EntryScope} from 'shared';

import type {TAB_ALL} from './constants';

export type TabId = EntryScope | typeof TAB_ALL;

export type Item = {
    id: TabId;
    title: string;
};
