import React from 'react';

import mapValues from 'lodash/mapValues';

import type {IllustrationStore} from './types';

export const getIllustrationStore = (): IllustrationStore => {
    const illustrationsSet = mapValues(
        {
            notFound: React.lazy(() => import('@gravity-ui/illustrations/NotFound')),
            noAccess: React.lazy(() => import('@gravity-ui/illustrations/AccessDenied')),
            error: React.lazy(() => import('@gravity-ui/illustrations/InternalError')),
            identity: React.lazy(() => import('@gravity-ui/illustrations/Identity')),
            project: React.lazy(() => import('@gravity-ui/illustrations/Project')),
            template: React.lazy(() => import('@gravity-ui/illustrations/Template')),
            emptyDirectory: React.lazy(() => import('@gravity-ui/illustrations/Folder')),
            successOperation: React.lazy(
                () => import('@gravity-ui/illustrations/SuccessOperation'),
            ),
            badRequest: React.lazy(() => import('@gravity-ui/illustrations/UnableToDisplay')),
        },
        (value) => ({type: 'lazy-component' as const, value}),
    );

    return {
        light: illustrationsSet,
        dark: illustrationsSet,
    };
};
