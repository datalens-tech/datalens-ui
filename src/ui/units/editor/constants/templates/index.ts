import control from './control';
import markdown from './markdown';
import module from './module';
import table from './table';

export const getEditorTemplates = () => {
    return [control, markdown, module, table];
};
