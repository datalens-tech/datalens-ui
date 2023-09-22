import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import {PreparedRowItemProps} from './types/PreparedRowItem';

export const connectionsComponentsMap = {
    PreparedRowItem: makeDefaultEmpty<PreparedRowItemProps>(),
} as const;
