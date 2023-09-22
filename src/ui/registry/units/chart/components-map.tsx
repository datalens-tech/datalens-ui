import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import {AlertDialogProps} from './types/components/AlertDialog';
import {ChartActionPanelButtonProps} from './types/components/ChartActionPanelButton';

export const chartComponentsMap = {
    ChartActionPanelButton: makeDefaultEmpty<ChartActionPanelButtonProps>(),
    AlertDialog: makeDefaultEmpty<AlertDialogProps>(),
} as const;
