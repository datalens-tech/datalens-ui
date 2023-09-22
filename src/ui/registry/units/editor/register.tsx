import {registry} from 'ui/registry';
import {exampleFunction} from 'ui/registry/functions/example-function';
import {EXAMPLE_FUNCTION} from 'ui/registry/units/common/constants/functions';

export const registerEditorPlugins = () => {
    registry.editor.functions.register({
        [EXAMPLE_FUNCTION]: exampleFunction,
    });
};
