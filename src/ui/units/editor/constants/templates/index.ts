import control from './control';
import d3 from './d3-chart';
import markdown from './markdown';
import module from './module';
import table from './table';

export const getEditorTemplates = () => {
    return [d3, table, markdown, control, module];
};
