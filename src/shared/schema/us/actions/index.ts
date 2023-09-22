import {collectionsActions} from './collections';
import {colorPalettesActions} from './color-palettes';
import {dlsActions} from './dls';
import {editorActions} from './editor';
import {embedsActions} from './embeds';
import {entriesActions} from './entries';
import {favoritesActions} from './favorites';
import {locksActions} from './locks';
import {operationsActions} from './operations';
import {presetsActions} from './presets';
import {privateActions} from './private';
import {stateActions} from './state';
import {templateActions} from './template';
import {userActions} from './user';
import {workbooksActions} from './workbooks';

export const actions = {
    ...entriesActions,
    ...presetsActions,
    ...locksActions,
    ...dlsActions,
    ...favoritesActions,
    ...editorActions,
    ...stateActions,
    ...userActions,
    ...templateActions,
    ...privateActions,
    ...collectionsActions,
    ...workbooksActions,
    ...colorPalettesActions,
    ...embedsActions,
    ...operationsActions,
};
