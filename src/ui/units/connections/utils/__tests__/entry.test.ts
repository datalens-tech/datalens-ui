import type {GetEntryResponse} from '../../../../../shared/schema/types';
import {hasPermissionsToEdit} from '../entry';

describe('connections/utils/entry', () => {
    test.each<[unknown, boolean]>([
        [{edit: true, admin: true}, true],
        [{edit: true, admin: false}, true],
        [{edit: false, admin: true}, true],
        [{edit: false, admin: false}, false],
    ])('hasPermissionsToEdit (args: %j)', (permissions, expected) => {
        const result = hasPermissionsToEdit(
            permissions as NonNullable<GetEntryResponse['permissions']>,
        );
        expect(result).toBe(expected);
    });
});
