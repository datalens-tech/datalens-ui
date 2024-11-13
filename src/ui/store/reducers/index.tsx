import user from 'store/reducers/user';
import asideHeader from 'store/reducers/asideHeader';
import {reducer as workbooks} from 'units/workbooks/store/reducers';
import dialog from 'store/reducers/dialog';
import landing from 'store/reducers/landing';
import entryContent from 'store/reducers/entryContent';
import colorPaletteEditor from 'store/reducers/colorPaletteEditor';
import {collectionsStructure} from 'store/reducers/collectionsStructure';
import {migrationToWorkbook} from 'ui/store/reducers/migrationToWorkbook';
import {copyEntriesToWorkbook} from 'ui/store/reducers/copyEntriesToWorkbook';

import {editHistory} from './editHistory';
import {controlDialog} from './controlDialog';

export default {
    controlDialog,
    user,
    asideHeader,
    workbooks,
    dialog,
    landing,
    entryContent,
    colorPaletteEditor,
    collectionsStructure,
    migrationToWorkbook,
    copyEntriesToWorkbook,
    editHistory,
};
