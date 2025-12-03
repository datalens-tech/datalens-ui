import type {ValueOf} from 'shared';
import {ErrorContentTypes} from 'shared';

import type {IllustrationName} from '../../ui/components/Illustration/types';
import {registry} from '../../ui/registry';

export type GetErrorContentTypesExtendedConfig = () => {
    getNotAuthenticatedErrorContentTypes: () => string[];
    getHeaderWithoutHelpCenterErrorContentTypes: () => string[];
    getHeaderWithoutNavigationErrorContentTypes: () => string[];
    getImageNameFromErrorContentType: (errorContentType: string) => IllustrationName | null;
};

const getErrorContentTypesExtendedConfig = (): ReturnType<GetErrorContentTypesExtendedConfig> => {
    const getExtendedConfig = registry.common.functions.get('getErrorContentTypesExtendedConfig');
    const errorContentTypesExtendedConfig = getExtendedConfig();

    return errorContentTypesExtendedConfig;
};

export const isNotAuthenticatedError = (errorType: string | undefined) => {
    if (!errorType) return false;

    const {getNotAuthenticatedErrorContentTypes} = getErrorContentTypesExtendedConfig();
    const extraNotAuthenticatedErrorContentTypes = getNotAuthenticatedErrorContentTypes();

    return (
        errorType === ErrorContentTypes.NOT_AUTHENTICATED ||
        extraNotAuthenticatedErrorContentTypes.includes(errorType)
    );
};

export const isHeaderWithoutHelpCenterError = (errorType: string | undefined) => {
    if (!errorType) return false;

    const {getHeaderWithoutHelpCenterErrorContentTypes} = getErrorContentTypesExtendedConfig();
    const extraHeaderWithoutHelpCenterErrorContentTypes =
        getHeaderWithoutHelpCenterErrorContentTypes();

    return (
        extraHeaderWithoutHelpCenterErrorContentTypes?.includes(errorType) ||
        [
            ErrorContentTypes.NEW_ORGANIZATION_USER,
            ErrorContentTypes.NEW_LOCAL_FEDERATION_USER,
            ErrorContentTypes.AUTH_FAILED,
            ErrorContentTypes.AUTH_DENIED,
            ErrorContentTypes.NOT_FOUND_BY_RESOLVE_TENANT,
            ErrorContentTypes.NOT_AUTHENTICATED,
        ].includes(errorType)
    );
};

export const isHeaderWithoutNavigationError = (errorType: string | undefined) => {
    if (!errorType) return false;

    const {getHeaderWithoutNavigationErrorContentTypes} = getErrorContentTypesExtendedConfig();
    const extraHeaderWithoutNavigationErrorContentTypes =
        getHeaderWithoutNavigationErrorContentTypes();

    return (
        extraHeaderWithoutNavigationErrorContentTypes?.includes(errorType) ||
        [
            ErrorContentTypes.CLOUD_FOLDER_ACCESS_DENIED,
            ErrorContentTypes.NEW_ORGANIZATION_USER,
            ErrorContentTypes.NEW_LOCAL_FEDERATION_USER,
            ErrorContentTypes.AUTH_FAILED,
            ErrorContentTypes.AUTH_DENIED,
            ErrorContentTypes.NOT_FOUND_BY_RESOLVE_TENANT,
            ErrorContentTypes.NOT_AUTHENTICATED,
            ErrorContentTypes.FORBIDDEN_AUTH,
        ].includes(errorType)
    );
};

export const getImageNameFromErrorContentType = (
    errorContentType: ValueOf<typeof ErrorContentTypes> | undefined,
): IllustrationName => {
    if (!errorContentType) {
        return 'error';
    }

    const {getImageNameFromErrorContentType: getImageNameFromErrorContentTypeExtended} =
        getErrorContentTypesExtendedConfig();

    let imageName: IllustrationName | null;

    imageName = getImageNameFromErrorContentTypeExtended(errorContentType);

    if (imageName) {
        return imageName;
    }

    switch (errorContentType) {
        case ErrorContentTypes.NOT_FOUND:
        case ErrorContentTypes.NOT_FOUND_BY_RESOLVE_TENANT:
            imageName = 'notFoundError';
            break;
        case ErrorContentTypes.NO_ACCESS:
        case ErrorContentTypes.CLOUD_FOLDER_ACCESS_DENIED:
        case ErrorContentTypes.NO_ENTRY_ACCESS:
        case ErrorContentTypes.AUTH_DENIED:
            imageName = 'noAccess';
            break;
        case ErrorContentTypes.ERROR:
        case ErrorContentTypes.AUTH_FAILED:
            imageName = 'error';
            break;
        case ErrorContentTypes.CREDENTIALS:
            imageName = 'identity';
            break;
        case ErrorContentTypes.INACCESSIBLE_ON_MOBILE:
        case ErrorContentTypes.FORBIDDEN_BY_PLAN:
        case ErrorContentTypes.FORBIDDEN_AUTH:
            imageName = 'project';
            break;
        default:
            imageName = 'error';
    }

    return imageName;
};
