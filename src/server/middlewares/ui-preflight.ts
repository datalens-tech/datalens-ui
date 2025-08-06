import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

// import {onFail} from '../../../api/server/callbacks';
// import {registry} from '../../../api/server/registry';
// import type {GatewayApiErrorResponse} from '../../../api/server/utils';
import {makeTenantIdFromOrgId} from '../../shared';
import {extractCollectionId} from '../../shared/utils/extractCollectionId';
import {extractEntryId} from '../../shared/utils/extractEntryId';
import {extractWorkbookId} from '../../shared/utils/extractWorkbookId';
import {registry} from '../registry';

export type YandexTenantFields = {
    tenantId: string;
    enabled: boolean;
    [key: string]: any;
};

export type ResolveTenantOptions = {
    onMissingEntry?: (req: Request, res: Response) => void;
    onForbiddenEntry?: (req: Request, res: Response, entryMeta: any) => void;
    onFail?: (req: Request, res: Response) => void;
    onMissingEntryByResolveTenant?: (req: Request, res: Response) => void;
};

export async function resolveTenantByEntry(
    req: Request,
    res: Response,
    options: ResolveTenantOptions = {},
): Promise<YandexTenantFields | null> {
    const {onFail: customOnFail, onMissingEntryByResolveTenant} = options;

    const {id: requestId, ctx} = req;
    const entryId = extractEntryId({input: req.path});
    const collectionId = extractCollectionId(req.path);
    const workbookId = extractWorkbookId(req.path);

    if (!entryId && !collectionId && !workbookId) {
        console.log('return null');
        return null;
    }

    const {gatewayApi} = registry.getGatewayApi();
    const {getAuthArgsUSPrivate} = registry.common.auth.getAll();
    const authArgsUSPrivate = getAuthArgsUSPrivate(req, res);

    try {
        const {responseData} = await gatewayApi.usPrivate._resolveTenant({
            ctx,
            headers: req.headers,
            requestId,
            authArgs: authArgsUSPrivate,
            args: {collectionId, workbookId, entryId},
        });

        console.log(responseData, 'responseData');
        console.log(collectionId, 'collectionId');
        console.log(workbookId, 'workbookId');
        console.log(entryId, 'entryId');

        ctx.log('PREFLIGHT_ENTRY_TENANT_RESOLVED', {
            resolvedTenantByEntryId: responseData.tenantId,
        });

        return responseData;
    } catch (e) {
        ctx.logError('PREFLIGHT_ENTRY_TENANT_RESOLVED_FAILED', e);
        const {error} = e as GatewayApiErrorResponse;
        if (error?.status === 404 && onMissingEntryByResolveTenant) {
            onMissingEntryByResolveTenant(req, res);
            return null;
        }
        customOnFail(req, res);
        return null;
    }
}

export type UiPreflightOptions = {
    // Callback для дополнительной обработки тенанта в ui-yandex
    onTenantResolved?: (tenant: YandexTenantFields, req: Request, res: Response) => Promise<void>;
    // Callback для обработки Internal installation
    onInternalInstallation?: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    // Callback для обработки текущего тенанта (не из entry)
    onCurrentTenant?: (
        req: Request,
        res: Response,
        currentTenantId: string,
    ) => Promise<YandexTenantFields | null>;
    // Callbacks для ошибок
    onMissingCurrentCloudFolder?: (req: Request, res: Response) => void;
    onMissingEntryByResolveTenant?: (req: Request, res: Response) => void;
    onForbiddenEntry?: (req: Request, res: Response, entryMeta: any) => void;
    currentTenantCookieName?: string;
    currentTenantIdQuery?: string;
    currentCloudFolderIdQuery?: string;
};

export function prepareUiPreflightMiddleware(options: UiPreflightOptions = {}) {
    const {
        onTenantResolved,
        onCurrentTenant,
        onMissingCurrentCloudFolder,
        onMissingEntryByResolveTenant,
        currentTenantCookieName = 'currentTenantId',
        currentTenantIdQuery = 'currentTenantId',
        currentCloudFolderIdQuery = 'currentCloudFolderId',
    } = options;

    async function uiPreflight(req: Request, res: Response, next: NextFunction) {
        const {ctx} = req;
        const userSettings = res.locals.userSettings;
        const organizations = res.locals.organizations;

        // Определение текущего тенанта
        const currentQueryTenantId =
            req.query[currentTenantIdQuery] || req.query[currentCloudFolderIdQuery];
        const currentCookieTenantId = req.cookies[currentTenantCookieName];
        let currentTenantId = currentQueryTenantId || currentCookieTenantId;

        if (
            !currentTenantId &&
            userSettings?.orgId &&
            organizations?.some((org: any) => org.id === userSettings.orgId)
        ) {
            currentTenantId = makeTenantIdFromOrgId(userSettings.orgId);
        }

        const respond = async (tenant: YandexTenantFields) => {
            res.locals.currentTenantId = tenant.tenantId;

            res.locals.defaultColorPaletteId = tenant?.settings?.defaultColorPaletteId;

            // Вызываем callback для дополнительной обработки тенанта в ui-yandex
            if (onTenantResolved) {
                await onTenantResolved(tenant, req, res);
            }

            return next();
        };

        // Попытка резолва тенанта по entry/collection/workbook
        const resolvedTenant = await resolveTenantByEntry(req, res, {
            onMissingEntryByResolveTenant,
            // onFail,
        });

        if (resolvedTenant) {
            ctx.log('PREFLIGHT_SUCCESSFULLY_RESOLVED_ENTRY_TENANT');
            return respond(resolvedTenant);
        }

        // Если не удалось резолвить по entry, пробуем текущий тенант
        if (currentTenantId && onCurrentTenant) {
            const currentTenant = await onCurrentTenant(req, res, currentTenantId);
            if (currentTenant) {
                ctx.log('PREFLIGHT_KEEPING_CURRENT_TENANT_ID', {currentTenantId});
                return respond(currentTenant);
            }
        }

        ctx.log('PREFLIGHT_MISSING_CURRENT_TENANT_ID', {currentTenantId});
        if (onMissingCurrentCloudFolder) {
            return onMissingCurrentCloudFolder(req, res);
        }
        // return onFail(req, res);
    }

    return function uiPreflightMiddleware(req: Request, res: Response, next: NextFunction) {
        uiPreflight(req, res, next)
            .catch((error) => {
                req.ctx.logError('UI_PREFLIGHT_FAILED', error);
                // onFail(req, res);
            })
            .catch((error) => next(error));
    };
}
