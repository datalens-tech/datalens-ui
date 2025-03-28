import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {CreateEditorChartButtonProps} from './types/CreateEditorChartButtonProps';
import type {PreparedRowItemProps} from './types/PreparedRowItem';

export const connectionsComponentsMap = {
    CreateEditorChartButton: makeDefaultEmpty<CreateEditorChartButtonProps>(),
    PreparedRowItem: makeDefaultEmpty<PreparedRowItemProps>(),
} as const;
