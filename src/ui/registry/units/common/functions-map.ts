import type {MarkdownItPluginCb} from '@diplodoc/transform/lib/plugins/typings';
import type {ActionPanelItem} from '@gravity-ui/dashkit';
import type {CancellablePromise} from '@gravity-ui/sdk';
import type {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import type {RenderHtmlOutput} from 'shared/modules/markdown/markdown';
import type {
    BatchRenderMarkdownResponse,
    CollectChartkitStatsArgs,
    CollectChartkitStatsResponse,
    CollectDashStatsArgs,
    CollectDashStatsResponse,
    GetDistinctsApiV2Args,
    GetDistinctsApiV2InfoHeadersArg,
    GetDistinctsApiV2TransformedResponse,
    GetEntryResponse,
} from 'shared/schema';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';

import type {DLUserSettings, EntryScope, IconId, formatNumber} from '../../../../shared';
import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {
    EntryContextMenuItem,
    EntryDialoguesRef,
    MenuGroup,
} from '../../../components/EntryContextMenu/helpers';
import type {ContextMenuItem} from '../../../components/EntryContextMenu/types';
import type {EntryData} from '../../../components/EntryTitle/types';
import type {EntrySettings} from '../../../components/Navigation/Base/configure';
import type {NavigationQuickItem} from '../../../components/Navigation/Base/types';
import type {NavigationMinimalProps} from '../../../components/Navigation/NavigationMinimal';
import type {PlaceParameterItem} from '../../../components/Navigation/types';
import type {ConfigSdk, HeadersSdk} from '../../../libs/sdk/types';
import type {AppThunkAction} from '../../../store';

import {EXAMPLE_FUNCTION} from './constants/functions';
import type {CheckCreateEntryButtonVisibility} from './types/functions/checkCreateEntryButtonVisibility';
import type {
    FetchDocumentationArgs,
    FetchDocumentationResponse,
} from './types/functions/fetchDocumentation';
import type {FetchFunctionsDocumentationResponse} from './types/functions/fetchFunctionsDocumentation';
import type {GetFunctionsDocumentationResponse} from './types/functions/getFunctionsDocumentation';
import type {GetIllustrationStore} from './types/functions/getIllustrationStore';
import type {GetLoginById} from './types/functions/getLoginById';
import type {GetUIEntryRouteArgs} from './types/functions/getUIEntryRoute';
import type {OpenDialogOrganizationInvite} from './types/functions/openDialogOrganizationInvite';
import type {OpenDialogOrganizationInviteUsers} from './types/functions/openDialogOrganizationInviteUsers';
import type {ResolveUsersByIds} from './types/functions/resolveUsersByIds';
import type {SetEntryKey} from './types/functions/setEntryKey';
import type {UseSubjectsListId} from './types/functions/useSubjectsListId';

export const commonFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    useSubjectsListId: makeFunctionTemplate<() => UseSubjectsListId>(),
    openDialogOrganizationInvite: makeFunctionTemplate<() => OpenDialogOrganizationInvite>(),
    openDialogOrganizationInviteUsers:
        makeFunctionTemplate<() => OpenDialogOrganizationInviteUsers>(),
    getEntryMenuConfig: makeFunctionTemplate<() => MenuGroup[]>(),
    getEntryPublishGloballyDisabled: makeFunctionTemplate<() => boolean>(),
    getMenuGroupConfig: makeFunctionTemplate<() => Array<MenuGroup>>(),
    getSelectStateMenuItem:
        makeFunctionTemplate<
            <T>(args: {action: () => void; hidden: boolean}) => EntryContextMenuItem<T>
        >(),
    getIconDataById: makeFunctionTemplate<(arg: IconId) => SVGIconData>(),
    getIllustrationStore: makeFunctionTemplate<() => GetIllustrationStore>(),
    getAccessEntryMenuItem: makeFunctionTemplate<() => ContextMenuItem>(),
    setEntryKey: makeFunctionTemplate<SetEntryKey>(),
    getMoveToWorkbooksMenuItem: makeFunctionTemplate<() => ContextMenuItem>(),
    setOldSdkDefaultHeaders:
        makeFunctionTemplate<(config: ConfigSdk, headers: HeadersSdk) => void>(),
    getIsCompact: makeFunctionTemplate<() => boolean>(),
    updateIsCompact: makeFunctionTemplate<(isCompact: boolean) => AppThunkAction>(),
    getPlaceSelectParameters:
        makeFunctionTemplate<
            (items: string[]) => NavigationMinimalProps['placeSelectParameters']
        >(),
    resolveUsersByIds: makeFunctionTemplate<<T>(ids: string[]) => ResolveUsersByIds<T>>({
        isReduxThunkActionTemplate: true,
    }),
    getLoginById: makeFunctionTemplate<() => GetLoginById>(),
    getEntryName: makeFunctionTemplate<(entry: EntryData) => string>(),
    getInitDestination: makeFunctionTemplate<(path?: string) => string>(),
    getNavigationQuickItems: makeFunctionTemplate<() => NavigationQuickItem[]>(),
    getNavigationCreatableEntriesConfig: makeFunctionTemplate<() => EntrySettings[]>(),
    getNavigationPlacesConfig: makeFunctionTemplate<() => PlaceParameterItem[]>(),

    getUpdatedUserSettings:
        makeFunctionTemplate<
            (settings: Partial<DLUserSettings>) => Promise<Partial<DLUserSettings> | undefined>
        >(),
    getUIEntryRoute: makeFunctionTemplate<(args: GetUIEntryRouteArgs) => string>(),
    getFormatNumber: makeFunctionTemplate<typeof formatNumber>(),
    getAdditionalEntryDialoguesMap: makeFunctionTemplate<() => Record<string, any>>(),
    getAdditionalEntryContextMenuAction:
        makeFunctionTemplate<
            (
                action: string,
                params: {entry: GetEntryResponse; entryDialoguesRef: EntryDialoguesRef},
            ) => void
        >(),
    getAdditionalEntryContextMenuItems: makeFunctionTemplate<() => ContextMenuItem[]>(),
    fetchDocumentation:
        makeFunctionTemplate<
            (args: FetchDocumentationArgs) => CancellablePromise<FetchDocumentationResponse>
        >(),
    getDocPathPrefix: makeFunctionTemplate<() => string>(),
    getFunctionsDocumentation:
        makeFunctionTemplate<() => Promise<GetFunctionsDocumentationResponse>>(),
    fetchFunctionsDocumentation:
        makeFunctionTemplate<
            (docsEndpoint: string, path: string) => Promise<FetchFunctionsDocumentationResponse>
        >(),
    isEntryId: makeFunctionTemplate<(value: string) => boolean>(),
    extractEntryId: makeFunctionTemplate<(value?: string) => string | null>(),
    getAdditionalMarkdownPlugins: makeFunctionTemplate<() => Promise<MarkdownItPluginCb[]>>(),
    fetchRenderedMarkdown: makeFunctionTemplate<(text: string) => Promise<RenderHtmlOutput>>(),
    fetchBatchRenderedMarkdown:
        makeFunctionTemplate<
            (texts: Record<string, string>) => Promise<BatchRenderMarkdownResponse>
        >(),
    fetchDistinctsByApi:
        makeFunctionTemplate<
            (
                params: GetDistinctsApiV2Args,
                headers?: GetDistinctsApiV2InfoHeadersArg,
            ) => Promise<GetDistinctsApiV2TransformedResponse>
        >(),
    requestCollectDashStats:
        makeFunctionTemplate<
            (dashStats: CollectDashStatsArgs) => Promise<CollectDashStatsResponse>
        >(),
    requestCollectChartkitStats:
        makeFunctionTemplate<
            (chartkitStats: CollectChartkitStatsArgs) => Promise<CollectChartkitStatsResponse>
        >(),
    migrateItemDataOnPaste:
        makeFunctionTemplate<
            ({
                itemData,
                toScope,
            }: {
                itemData: CopiedConfigData;
                toScope: EntryScope;
            }) => CopiedConfigData
        >(),
    checkCreateEntryButtonVisibility: makeFunctionTemplate<CheckCreateEntryButtonVisibility>(),
    getBasicActionPanelItems: makeFunctionTemplate<() => ActionPanelItem[]>(),
    getListMembersFilter:
        makeFunctionTemplate<({search, tabId}: {search: string; tabId: string}) => string | null>(),
    getTopLevelEntryScopes: makeFunctionTemplate<() => EntryScope[]>(),
    getAllEntryScopes: makeFunctionTemplate<() => EntryScope[]>(),
    getScopeTypeIcon: makeFunctionTemplate<(scope: EntryScope) => string | null>(),
    getEntryScopesWithRevisionsList: makeFunctionTemplate<() => EntryScope[]>(),
    getRevisionsPanelEntryScopesTexts: makeFunctionTemplate<
        () => {
            [key: string]: {
                scopeText: string;
                panelText: string;
            };
        }
    >(),
    getRestrictedParamNames: makeFunctionTemplate<() => string[]>(),
} as const;
