import type {DashData} from '../../../..';
import {DashSchemeConverter} from '../../../..';
import {ServerError} from '../../../../constants/error';
import type {DashV1, GetEntryResponse} from '../../../types';
import {DASH_VERSION_1} from '../../schemas/dash/dash-v1';

import {normalizeDashData} from './normalize-dash-data';

export const migrateDashToV1 = ({
    version,
    scope,
    entryId,
    key,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    revId,
    savedId,
    publishedId,
    tenantId,
    hidden,
    public: isPublic,
    workbookId,
    meta,
    type,
    data,
    annotation,
    links,
}: GetEntryResponse): DashV1 => {
    if (version && version > DASH_VERSION_1) {
        throw new ServerError(`Unsupported dashboard version: ${version}`, {
            status: 500,
        });
    }

    let migratedAnnotation = annotation;

    if (
        !migratedAnnotation &&
        data &&
        'description' in data &&
        typeof data.description === 'string'
    ) {
        migratedAnnotation = {
            description: data.description,
        };
    }

    let migratedData: DashData;

    if (
        version === DASH_VERSION_1 ||
        !DashSchemeConverter.isUpdateNeeded(data as unknown as DashData)
    ) {
        migratedData = data as unknown as DashData;
    } else {
        migratedData = DashSchemeConverter.update(data as unknown as DashData);
    }

    const normalizedData = normalizeDashData(migratedData);

    return {
        version: DASH_VERSION_1,
        scope,
        entryId,
        key,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
        revId,
        savedId,
        publishedId,
        tenantId,
        hidden,
        public: isPublic,
        workbookId,
        meta,
        annotation: migratedAnnotation,
        links,
        type,
        data: normalizedData,
    } as DashV1;
};
