import {registry} from '../../../registry';
import {exampleFunction} from '../../../registry/functions/example-function';
import {EXAMPLE_FUNCTION} from '../../../registry/units/common/constants/functions';
import {getEmptyTemplateType} from '../../../units/editor/constants/common';
import {getEditorTemplates} from '../../../units/editor/constants/templates';

import {EDITOR_CHOOSE_TPL} from './constants/components';

export const registerEditorPlugins = () => {
    registry.editor.components.registerMany({
        [EDITOR_CHOOSE_TPL]: () => null,
    });

    registry.editor.functions.register({
        [EXAMPLE_FUNCTION]: exampleFunction,
        getEditorTemplates,
        getEmptyTemplateType,
    });
};
