import {registry} from '../../../registry';
import {exampleFunction} from '../../../registry/functions/example-function';
import {EXAMPLE_FUNCTION} from '../../../registry/units/common/constants/functions';
import {getEmptyTemplateType} from '../../../units/editor/constants/common';
import {getEditorTemplates} from '../../../units/editor/constants/templates';
import {getEditorTypeDefinitions} from '../../../units/editor/libs/monaco/getEditorTypeDefinitions';

export const registerEditorPlugins = () => {
    registry.editor.functions.register({
        [EXAMPLE_FUNCTION]: exampleFunction,
        getEditorTemplates,
        getEmptyTemplateType,
        getEditorTypeDefinitions,
    });
};
