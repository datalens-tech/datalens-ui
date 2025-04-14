import {generateRandomPassword} from '../utils';

describe('auth formControls', () => {
    test(`generateRandomPassword generates a password in the correct format.`, () => {
        expect(generateRandomPassword()).toMatch(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_-]).{8,}$/,
        );
    });
});
