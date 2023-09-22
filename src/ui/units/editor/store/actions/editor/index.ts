import {ChartActions} from './chart';
import {CodeActions} from './code';
import {PanesActions} from './panes';

export * from './code';
export * from './panes';
export * from './chart';

export type EditorActions = CodeActions | PanesActions | ChartActions;
