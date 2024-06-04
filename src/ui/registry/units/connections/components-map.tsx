import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {PreparedRowItemProps} from './types/PreparedRowItem';

export const connectionsComponentsMap = {
    PreparedRowItem: makeDefaultEmpty<PreparedRowItemProps>(),
} as const;
