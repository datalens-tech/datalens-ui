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
import {editHistory} from 'ui/store/reducers/editHistory';
import {controlDialog} from 'ui/store/reducers/controlDialog';

export default {
    user,
    asideHeader,
    workbooks,
    dialog,
    landing,
    entryContent,
    colorPaletteEditor,
    collectionsStructure,
    controlDialog,
    migrationToWorkbook,
    copyEntriesToWorkbook,
    editHistory,
};
