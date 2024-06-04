import type {GraphWidgetEventScope, WidgetEventHandler} from 'shared';

export type ShapedAction = {
    type: WidgetEventHandler['type'];
    scope?: GraphWidgetEventScope;
};
