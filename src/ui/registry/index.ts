import libs from './libs';
import chartRegistry from './units/chart';
import collectionsRegistry from './units/collections';
import commonRegistry from './units/common';
import connectionsRegistry from './units/connections';
import dashRegistry from './units/dash';
import docsRegistry from './units/docs';
import editorRegistry from './units/editor';
import mainRegistry from './units/main';
import previewRegistry from './units/preview';
import publicRegistry from './units/public';
import qlRegistry from './units/ql';
import wizardRegistry from './units/wizard';
import workbooksRegistry from './units/workbooks';

export const registry = {
    chart: chartRegistry,
    common: commonRegistry,
    connections: connectionsRegistry,
    dash: dashRegistry,
    editor: editorRegistry,
    preview: previewRegistry,
    ql: qlRegistry,
    wizard: wizardRegistry,
    public: publicRegistry,
    workbooks: workbooksRegistry,
    collections: collectionsRegistry,
    main: mainRegistry,
    docs: docsRegistry,

    libs,
};
