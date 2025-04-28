import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import {ACTION_PANEL_BUTTON} from './constants/components';
import type {ActionPanelButtonProps} from './types/components/ActionPanelButton';

export const editorComponentsMap = {
    [ACTION_PANEL_BUTTON]: makeDefaultEmpty<ActionPanelButtonProps>(),
} as const;
