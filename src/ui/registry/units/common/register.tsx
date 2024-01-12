import {getIsCompact, updateIsCompact} from 'ui/store/utils/asideHeader';

import {formatNumber} from '../../../../shared/modules/format-units/formatUnit';
import {EntryBreadcrumbs} from '../../../components/EntryBreadcrumbs/EntryBreadcrumbs';
import {getEntryMenuConfig, getMenuGroupConfig} from '../../../components/EntryContextMenu/helpers';
import {getAdditionalEntryContextMenuItems} from '../../../components/EntryContextMenu/utils';
import {getAdditionalEntryDialoguesMap} from '../../../components/EntryDialogues/utils';
import {getEntryName} from '../../../components/EntryTitle/utils';
import {Illustration} from '../../../components/Illustration/Illustration';
import {getIllustrationStore} from '../../../components/Illustration/getIllustrationStore';
import {getLoginById} from '../../../components/Login/utils';
import {MobileHeaderComponent} from '../../../components/MobileHeader/MobileHeaderComponent/MobileHeaderComponent';
import {getQuickItems} from '../../../components/Navigation/Base/configure';
import {getInitDestination} from '../../../components/Navigation/Base/utils';
import {getPlaceSelectParameters} from '../../../components/Navigation/util';
import {UserAvatarById} from '../../../components/UserAvatar/UserAvatarById';
import {YfmWrapperContent} from '../../../components/YfmWrapper/YfmWrapperContent';
import {DatepickerControl} from '../../../components/common/DatepickerControl/DatepickerControl';
import {getUpdatedUserSettings} from '../../../store/utils/user';
import {getIconDataById} from '../../../utils/icons';
import {getUIEntryRoute} from '../../../utils/urlUtils';
import {exampleFunction} from '../../functions/example-function';
import {registry} from '../../index';

import {EXAMPLE_FUNCTION} from './constants/functions';

export const registerCommonPlugins = () => {
    registry.common.components.registerMany({
        MobileHeaderComponent,
        PlaceholderIllustrationImage: Illustration,
        UserAvatarById,
        EntryBreadcrumbs,
        YfmWrapperContent,
        DatepickerControl,
    });

    registry.common.functions.register({
        [EXAMPLE_FUNCTION]: exampleFunction,
        getEntryMenuConfig,
        getMenuGroupConfig,
        getIconDataById,
        getIllustrationStore,
        getIsCompact,
        updateIsCompact,
        getPlaceSelectParameters,
        getLoginById,
        getEntryName,
        getInitDestination,
        getNavigationQuickItems: getQuickItems,
        getUpdatedUserSettings,
        getUIEntryRoute,
        getFormatNumber: formatNumber,
        getAdditionalEntryDialoguesMap,
        getAdditionalEntryContextMenuItems,
    });
};
