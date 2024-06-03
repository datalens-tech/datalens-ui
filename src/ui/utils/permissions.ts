import {i18n} from 'i18n';
import _ from 'lodash';

import type {
    EmptyObject,
    PermissionAdded,
    PermissionModified,
    PermissionParticipant,
    PermissionPendingParticipant,
    PermissionRemoved,
} from '../../shared';
import {DlsAcl} from '../../shared';
import type {
    BatchPermissionsArgs,
    GetPermissionsResponse,
    ModifyPermissionsBody,
} from '../../shared/schema';
import {PERMISSION} from '../constants';
import {getSdk} from '../libs/schematic-sdk';

type Participant = PermissionPendingParticipant | PermissionParticipant;

type FormattedParticipant = {
    [K in keyof Participant]: null extends Participant[K]
        ? EmptyObject | NonNullable<Participant[K]>
        : Participant[K];
};

export type FormattedPermissionParticipant = FormattedParticipant & {permission: DlsAcl};

function isNullOrUndefined(value: any): value is null | undefined {
    return value === null || value === undefined;
}

export function formPermissionParticipants(
    permissions:
        | GetPermissionsResponse['permissions']
        | GetPermissionsResponse['pendingPermissions'],
) {
    return Object.entries(permissions)
        .reduce((participants: FormattedPermissionParticipant[], permissionEntries) => {
            const permission = permissionEntries[0] as DlsAcl;
            const participantsByPermission = permissionEntries[1] as NonNullable<Participant>[];
            participantsByPermission.forEach((participantByPermission) => {
                const participantByPermissionFormatted = Object.keys(
                    participantByPermission,
                ).reduce((formattedParticipant, participantKey) => {
                    const key = participantKey as keyof Participant;
                    const value = participantByPermission[key];
                    return {
                        ...formattedParticipant,
                        [key]: isNullOrUndefined(value) ? {} : value,
                    };
                }, {} as FormattedParticipant);

                participants.push({
                    ...participantByPermissionFormatted,
                    permission,
                });
            });

            return participants;
        }, [])
        .sort((prev: FormattedPermissionParticipant, next: FormattedPermissionParticipant) => {
            if (prev.name > next.name) {
                return 1;
            } else if (prev.name < next.name) {
                return -1;
            } else {
                return 0;
            }
        });
}

export function getTextByPermission(permission: string) {
    switch (permission) {
        case PERMISSION.READ:
            return i18n('component.permission-select.view', 'field_read');
        case PERMISSION.WRITE:
            return i18n('component.permission-select.view', 'field_write');
        case PERMISSION.ADMIN:
            return i18n('component.permission-select.view', 'field_admin');
        case PERMISSION.EXECUTE:
            return i18n('component.permission-select.view', 'field_execute');
        default:
            return '';
    }
}

const getDefaultPermissionBody = (action: 'add' | 'remove' | 'modify'): ModifyPermissionsBody => {
    return action === 'modify'
        ? {diff: {added: {}, removed: {}, modified: {}}}
        : {diff: {added: {}, removed: {}}};
};

export function removePermission({
    body = getDefaultPermissionBody('remove'),
    permission,
    subject,
    comment = '',
}: {
    body?: ModifyPermissionsBody;
    permission: string;
    subject: string;
    comment?: string;
}): ModifyPermissionsBody {
    return {
        ...body,
        diff: {
            ...body.diff,
            removed: {
                ...body.diff.removed,
                [permission]: [
                    ...(body.diff.removed?.[permission as keyof PermissionRemoved] || []),
                    {
                        subject,
                        comment,
                    },
                ],
            },
        },
    };
}

export function removePermissionForSubjects({
    body = getDefaultPermissionBody('remove'),
    permission,
    subjects,
    comment,
}: {
    body?: ModifyPermissionsBody;
    permission: string;
    subjects: string[];
    comment?: string;
}): ModifyPermissionsBody {
    return subjects.reduce((accBody: ModifyPermissionsBody, subject) => {
        return removePermission({body: accBody, permission, comment, subject});
    }, body);
}

export function removeAllPermissionsForSubjects({
    body = getDefaultPermissionBody('remove'),
    subjects,
    comment,
}: {
    body?: ModifyPermissionsBody;
    subjects: string[];
    comment?: string;
}): ModifyPermissionsBody {
    return Object.values(DlsAcl).reduce((accBody: ModifyPermissionsBody, permission) => {
        return removePermissionForSubjects({body: accBody, comment, subjects, permission});
    }, body);
}

export function modifyPermission({
    body = getDefaultPermissionBody('modify'),
    newPermission,
    permission,
    subject,
    newSubject = subject,
    comment = '',
}: {
    body?: ModifyPermissionsBody;
    newPermission: string;
    permission: string;
    subject: string;
    newSubject?: string;
    comment?: string;
}): ModifyPermissionsBody {
    return {
        ...body,
        diff: {
            ...body.diff,
            modified: {
                ...body.diff.modified,
                [permission]: [
                    ...(body.diff.modified?.[permission as keyof PermissionModified] || []),
                    {
                        subject,
                        comment,
                        new: {
                            subject: newSubject,
                            grantType: newPermission,
                        },
                    },
                ],
            },
        },
    };
}

export function addPermission({
    body = getDefaultPermissionBody('add'),
    permission = PERMISSION.READ,
    subject,
    comment = '',
}: {
    body?: ModifyPermissionsBody;
    permission?: string;
    subject: string;
    comment?: string;
}): ModifyPermissionsBody {
    return {
        ...body,
        diff: {
            ...body.diff,
            added: {
                ...body.diff.added,
                [permission]: [
                    ...(body.diff.added?.[permission as keyof PermissionAdded] || []),
                    {
                        subject,
                        comment,
                    },
                ],
            },
        },
    };
}

export function addPermissionForSubjects({
    body = getDefaultPermissionBody('add'),
    permission,
    subjects,
    comment,
}: {
    body?: ModifyPermissionsBody;
    permission: string;
    subjects: string[];
    comment?: string;
}): ModifyPermissionsBody {
    return subjects.reduce((accBody: ModifyPermissionsBody, subject) => {
        return addPermission({body: accBody, permission, comment, subject});
    }, body);
}

export async function batchPermissions({nodes}: BatchPermissionsArgs) {
    const CHUNK_SIZE = 100;
    const chunks = _.chunk(nodes, CHUNK_SIZE);
    for (const chunkNodes of chunks) {
        await getSdk().us.batchPermissions({nodes: chunkNodes});
    }
}
