import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import {ACTION_PANEL_BUTTON, EDITOR_CHOOSE_TPL} from './constants/components';
import type {ActionPanelButtonProps} from './types/components/ActionPanelButton';
import type {EditorChooseTemplateProps} from './types/components/EditorChooseTemplate';

export const editorComponentsMap = {
    [ACTION_PANEL_BUTTON]: makeDefaultEmpty<ActionPanelButtonProps>(),
    [EDITOR_CHOOSE_TPL]: makeDefaultEmpty<EditorChooseTemplateProps>(),
} as const;
