import {dashActions} from './dash';
import {editorActions} from './editor';
import {entriesActions} from './entries';
import {markdownActions} from './markdown';
import {navigationActions} from './navigation';

export const actions = {
    ...navigationActions,
    ...entriesActions,
    ...markdownActions,
    ...dashActions,
    ...editorActions,
};
