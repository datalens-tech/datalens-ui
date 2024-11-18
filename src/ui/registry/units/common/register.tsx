import {extractEntryId, isEntryId} from 'shared';
import {getEntryScopesWithRevisionsList} from 'ui/components/RevisionsPanel/utils';
import {getIsCompact, updateIsCompact} from 'ui/store/utils/asideHeader';
import {getRestrictedParamNames} from 'ui/utils/getRestrictedParamNames';
import {setEntryKey} from 'ui/utils/setEntryKey';

import {formatNumber} from '../../../../shared/modules/format-units/formatUnit';
import {EntryBreadcrumbs} from '../../../components/EntryBreadcrumbs/EntryBreadcrumbs';
import {getEntryMenuConfig, getMenuGroupConfig} from '../../../components/EntryContextMenu/helpers';
import {getAdditionalEntryContextMenuItems} from '../../../components/EntryContextMenu/utils';
import {getAdditionalEntryDialoguesMap} from '../../../components/EntryDialogues/utils';
import {getEntryName} from '../../../components/EntryTitle/utils';
import {Illustration} from '../../../components/Illustration/Illustration';
import {getIllustrationStore} from '../../../components/Illustration/getIllustrationStore';
import {getLoginById} from '../../../components/Login/utils';
import {MarkdownControl} from '../../../components/MarkdownControl/MarkdownControl';
import {MobileHeaderComponent} from '../../../components/MobileHeader/MobileHeaderComponent/MobileHeaderComponent';
import {
    getCreatableEntriesConfig,
    getPlacesConfig,
    getQuickItems,
} from '../../../components/Navigation/Base/configure';
import {getInitDestination} from '../../../components/Navigation/Base/utils';
import {getPlaceSelectParameters} from '../../../components/Navigation/util';
import {UserAvatarById} from '../../../components/UserAvatar/UserAvatarById';
import {YfmWrapperContent} from '../../../components/YfmWrapper/YfmWrapperContent';
import {DatepickerControl} from '../../../components/common/DatepickerControl/DatepickerControl';
import {getUpdatedUserSettings} from '../../../store/utils/user';
import {WorkbookEntriesTableTabs} from '../../../units/workbooks/components/Table/WorkbookEntriesTable/WorkbookEntriesTableTabs';
import {getAllEntryScopes} from '../../../utils/getAllEntryScopes';
import {getBasicActionPanelItems} from '../../../utils/getBasicActionPanelItems';
import {getRevisionsPanelEntryScopesTexts} from '../../../utils/getRevisionsPanelEntryScopesTexts';
import {getScopeTypeIcon} from '../../../utils/getScopeTypeIcon';
import {getTopLevelEntryScopes} from '../../../utils/getTopLevelEntryScopes';
import {getIconDataById} from '../../../utils/icons';
import {migrateItemDataOnPaste} from '../../../utils/migrateItemDataOnPaste';
import {
    fetchBatchRenderedMarkdown,
    fetchDistinctsByApi,
    fetchRenderedMarkdown,
    requestCollectChartkitStats,
    requestCollectDashStats,
} from '../../../utils/sdkRequests';
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
        MarkdownControl,
        WorkbookEntriesTableTabs,
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
        getNavigationCreatableEntriesConfig: getCreatableEntriesConfig,
        getNavigationPlacesConfig: getPlacesConfig,
        setEntryKey,
        getUpdatedUserSettings,
        getUIEntryRoute,
        getFormatNumber: formatNumber,
        getAdditionalEntryDialoguesMap,
        getAdditionalEntryContextMenuItems,
        isEntryId,
        extractEntryId,
        getAdditionalMarkdownPlugins: async () => [],
        fetchRenderedMarkdown,
        fetchBatchRenderedMarkdown,
        fetchDistinctsByApi,
        requestCollectDashStats,
        requestCollectChartkitStats,
        migrateItemDataOnPaste,
        checkCreateEntryButtonVisibility: () => true,
        getBasicActionPanelItems,
        getListMembersFilter: () => null,
        getAllEntryScopes,
        getTopLevelEntryScopes,
        getScopeTypeIcon,
        getEntryScopesWithRevisionsList,
        getRevisionsPanelEntryScopesTexts,
        getRestrictedParamNames,
    });
};
