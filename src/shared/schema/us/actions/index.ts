import {collectionsActions} from './collections';
import {colorPalettesActions} from './color-palettes';
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
import {tenantActions} from './tenant';
import {userActions} from './user';
import {workbooksActions} from './workbooks';

export const actions = {
    ...entriesActions,
    ...presetsActions,
    ...locksActions,
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
    ...tenantActions,
};
