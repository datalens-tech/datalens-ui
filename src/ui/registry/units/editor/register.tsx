import {getEditorTemplates} from '../../../../shared/constants/editor-templates';
import {registry} from '../../../registry';
import {exampleFunction} from '../../../registry/functions/example-function';
import {EXAMPLE_FUNCTION} from '../../../registry/units/common/constants/functions';

export const registerEditorPlugins = () => {
    registry.editor.functions.register({
        [EXAMPLE_FUNCTION]: exampleFunction,
        getEditorTemplates,
    });
};
