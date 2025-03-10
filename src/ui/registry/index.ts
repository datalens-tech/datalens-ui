import libs from './libs';
import authRegistry from './units/auth';
import chartRegistry from './units/chart';
import collectionsRegistry from './units/collections';
import commonRegistry from './units/common';
import connectionsRegistry from './units/connections';
import dashRegistry from './units/dash';
import datasetsRegistry from './units/datasets';
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
    datasets: datasetsRegistry,
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
    auth: authRegistry,

    libs,
};
