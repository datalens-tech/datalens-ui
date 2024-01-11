import {exampleFunction} from 'ui/registry/functions/example-function';
import {EXAMPLE_FUNCTION} from 'ui/registry/units/common/constants/functions';
import {getMinAutoupdateInterval} from 'ui/units/dash/containers/Dialogs/Settings/utils';

import {DialogDashMeta} from '../../../components/EntryDialogues/DialogDashMeta/DialogDashMeta';
import {getCaptionText} from '../../../units/dash/containers/Dialogs/Tabs/PopupWidgetsOrder/helpers';
import DialogText from '../../../units/dash/containers/Dialogs/Text/Text';
import {getExtendedItemData} from '../../../units/dash/store/actions/helpers';
import {getDashEntryUrl, getNewDashUrl} from '../../../units/dash/utils/url';
import {registry} from '../../index';

export const registerDashPlugins = () => {
    registry.dash.components.registerMany({
        DialogDashMeta,
        DialogText,
    });

    registry.dash.functions.register({
        [EXAMPLE_FUNCTION]: exampleFunction,
        getCaptionText,
        getNewDashUrl,
        getDashEntryUrl,
        getMinAutoupdateInterval,
        getExtendedItemData,
    });
};
