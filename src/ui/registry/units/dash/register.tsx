import {exampleFunction} from 'ui/registry/functions/example-function';
import {EXAMPLE_FUNCTION} from 'ui/registry/units/common/constants/functions';

import {DialogDashMeta} from '../../../components/EntryDialogues/DialogDashMeta/DialogDashMeta';
import {getCaptionText} from '../../../units/dash/containers/Dialogs/Tabs/PopupWidgetsOrder/helpers';
import DialogText from '../../../units/dash/containers/Dialogs/Text/Text';
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
    });
};
