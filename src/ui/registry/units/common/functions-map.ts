import type {CancellablePromise} from '@gravity-ui/sdk';
import type {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import type {GetEntryResponse} from 'shared/schema';

import type {DLUserSettings, IconId, formatNumber} from '../../../../shared';
import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {
    EntryContextMenuItem,
    EntryDialoguesRef,
    MenuGroup,
} from '../../../components/EntryContextMenu/helpers';
import type {ContextMenuItem} from '../../../components/EntryContextMenu/types';
import type {EntryData} from '../../../components/EntryTitle/types';
import type {NavigationQuickItem} from '../../../components/Navigation/Base/types';
import type {NavigationMinimalProps} from '../../../components/Navigation/NavigationMinimal';
import type {ConfigSdk, HeadersSdk} from '../../../libs/sdk/types';
import type {AppThunkAction} from '../../../store';

import {EXAMPLE_FUNCTION} from './constants/functions';
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
import type {UseSubjectsListId} from './types/functions/useSubjectsListId';

export const commonFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    useSubjectsListId: makeFunctionTemplate<() => UseSubjectsListId>(),
    openDialogOrganizationInvite: makeFunctionTemplate<() => OpenDialogOrganizationInvite>(),
    openDialogOrganizationInviteUsers:
        makeFunctionTemplate<() => OpenDialogOrganizationInviteUsers>(),
    getEntryMenuConfig: makeFunctionTemplate<() => MenuGroup[]>(),
    getMenuGroupConfig: makeFunctionTemplate<() => Array<MenuGroup>>(),
    getSelectStateMenuItem:
        makeFunctionTemplate<
            <T>(args: {action: () => void; hidden: boolean}) => EntryContextMenuItem<T>
        >(),
    getIconDataById: makeFunctionTemplate<(arg: IconId) => SVGIconData>(),
    getIllustrationStore: makeFunctionTemplate<() => GetIllustrationStore>(),
    getAccessEntryMenuItem: makeFunctionTemplate<() => ContextMenuItem>(),
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
} as const;
