import {dashActions} from './dash';
import {editorActions} from './editor';
import {entriesActions} from './entries';
import {markdownActions} from './markdown';
import {navigationActions} from './navigation';
import {qlActions} from './ql';
import {wizardActions} from './wizard';

export const actions = {
    ...navigationActions,
    ...entriesActions,
    ...markdownActions,
    ...dashActions,
    ...editorActions,
    ...wizardActions,
    ...qlActions,
};
