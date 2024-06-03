import type {ChartActions} from './chart';
import type {CodeActions} from './code';
import type {PanesActions} from './panes';

export * from './code';
export * from './panes';
export * from './chart';

export type EditorActions = CodeActions | PanesActions | ChartActions;
