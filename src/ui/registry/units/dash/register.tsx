import {exampleFunction} from 'ui/registry/functions/example-function';
import {EXAMPLE_FUNCTION} from 'ui/registry/units/common/constants/functions';
import {getMinAutoupdateInterval} from 'ui/units/dash/containers/Dialogs/Settings/utils';

import DialogTextWidget from '../../../components/DialogTextWidget/DialogTextWidget';
import {getCaptionText} from '../../../units/dash/containers/Dialogs/Tabs/PopupWidgetsOrder/helpers';
import {getExtendedItemData} from '../../../units/dash/store/actions/helpers';
import {getDashEntryUrl, getNewDashUrl} from '../../../units/dash/utils/url';
import {registry} from '../../index';

export const registerDashPlugins = () => {
    registry.dash.components.registerMany({
        DialogTextWidget,
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
