import {getFieldEditorDocPath} from '../../../components/FieldEditor/utils';
import {registry} from '../../index';

export const registerDocsPlugins = () => {
    registry.docs.functions.register({getFieldEditorDocPath});
};
