import type {ValueOf} from 'shared';
import {ErrorContentTypes} from 'shared';

import type {IllustrationName} from '../../ui/components/Illustration/types';
import {registry} from '../../ui/registry';

export const isNotAuthenticatedError = (errorType: string | undefined) => {
    if (!errorType) return false;

    const getNotAuthenticatedErrorContentTypes = registry.common.functions.get(
        'getNotAuthenticatedErrorContentTypes',
    );
    const notAuthenticatedErrorContentTypesExtended = getNotAuthenticatedErrorContentTypes();

    return (
        notAuthenticatedErrorContentTypesExtended.includes(errorType) ||
        errorType === ErrorContentTypes.NOT_AUTHENTICATED ||
        errorType === ErrorContentTypes.NOT_AUTHENTICATED_GALLERY ||
        errorType === ErrorContentTypes.NOT_AUTHENTICATED_FESTIVAL
    );
};

export const isHeaderWithoutHelpCenterError = (errorType: string | undefined) => {
    if (!errorType) return false;

    const getHeaderWithoutHelpCenterErrorContentTypes = registry.common.functions.get(
        'getHeaderWithoutHelpCenterErrorContentTypes',
    );
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
            ErrorContentTypes.NOT_AUTHENTICATED_GALLERY,
        ].includes(errorType)
    );
};

export const isHeaderWithoutNavigationError = (errorType: string | undefined) => {
    if (!errorType) return false;

    const getHeaderWithoutNavigationErrorContentTypes = registry.common.functions.get(
        'getHeaderWithoutNavigationErrorContentTypes',
    );
    const extraHeaderWithoutNavigationErrorContentTypes =
        getHeaderWithoutNavigationErrorContentTypes();

    return (
        extraHeaderWithoutNavigationErrorContentTypes?.includes(errorType) ||
        [
            ErrorContentTypes.NOT_FOUND_CURRENT_CLOUD_FOLDER,
            ErrorContentTypes.CLOUD_FOLDER_ACCESS_DENIED,
            ErrorContentTypes.NEW_ORGANIZATION_USER,
            ErrorContentTypes.NEW_LOCAL_FEDERATION_USER,
            ErrorContentTypes.AUTH_FAILED,
            ErrorContentTypes.AUTH_DENIED,
            ErrorContentTypes.NOT_FOUND_BY_RESOLVE_TENANT,
            ErrorContentTypes.NOT_AUTHENTICATED,
            ErrorContentTypes.FORBIDDEN_AUTH,
            ErrorContentTypes.NOT_AUTHENTICATED_GALLERY,
        ].includes(errorType)
    );
};

export const getImageNameFromErrorContentType = (
    errorContentType: ValueOf<typeof ErrorContentTypes> | undefined,
): IllustrationName => {
    if (!errorContentType) {
        return 'error';
    }

    const getImageNameFromErrorContentTypeExtended = registry.common.functions.get(
        'getImageNameFromErrorContentType',
    );

    const imageNameExtended = getImageNameFromErrorContentTypeExtended(errorContentType);

    if (imageNameExtended) {
        return imageNameExtended;
    }

    switch (errorContentType) {
        case ErrorContentTypes.NOT_FOUND:
        case ErrorContentTypes.NOT_FOUND_CURRENT_CLOUD_FOLDER:
        case ErrorContentTypes.NOT_FOUND_BY_RESOLVE_TENANT:
            return 'notFoundError';
        case ErrorContentTypes.NO_ACCESS:
        case ErrorContentTypes.CLOUD_FOLDER_ACCESS_DENIED:
        case ErrorContentTypes.NO_ENTRY_ACCESS:
        case ErrorContentTypes.AUTH_DENIED:
            return 'noAccess';
        case ErrorContentTypes.ERROR:
        case ErrorContentTypes.AUTH_FAILED:
            return 'error';
        case ErrorContentTypes.CREDENTIALS:
        case ErrorContentTypes.LICENSE_EXPIRED:
            return 'identity';
        case ErrorContentTypes.INACCESSIBLE_ON_MOBILE:
        case ErrorContentTypes.FORBIDDEN_BY_PLAN:
        case ErrorContentTypes.FORBIDDEN_AUTH:
            return 'project';
        default:
            return 'error';
    }
};
