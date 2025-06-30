import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {AlertDialogProps} from './types/components/AlertDialog';
import type {ChartActionPanelButtonProps} from './types/components/ChartActionPanelButton';
import type {ChartHeaderProps} from './types/components/ChartHeader';

export const chartComponentsMap = {
    ChartActionPanelButton: makeDefaultEmpty<ChartActionPanelButtonProps>(),
    ChartHeader: makeDefaultEmpty<ChartHeaderProps>(),
    AlertDialog: makeDefaultEmpty<AlertDialogProps>(),
} as const;
