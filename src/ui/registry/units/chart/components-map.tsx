import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {AlertDialogProps} from './types/components/AlertDialog';
import type {ChartActionPanelButtonProps} from './types/components/ChartActionPanelButton';

export const chartComponentsMap = {
    ChartActionPanelButton: makeDefaultEmpty<ChartActionPanelButtonProps>(),
    AlertDialog: makeDefaultEmpty<AlertDialogProps>(),
} as const;
