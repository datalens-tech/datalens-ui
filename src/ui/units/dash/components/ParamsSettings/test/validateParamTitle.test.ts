import {RESTRICTED_PARAM_NAMES} from 'shared';

import {validateParamTitle} from '../helpers';

describe('validateParamTitle', () => {
    test(`Check validation of dash params`, () => {
        // valid param
        expect(validateParamTitle('valid_param')).toEqual(null);

        // invalid param starts with _ (underscore)
        expect(validateParamTitle('_invalid_param')).not.toEqual(null);

        // invalid param from banned list for use
        for (const restrictedParam of RESTRICTED_PARAM_NAMES) {
            expect(validateParamTitle(restrictedParam)).not.toEqual(null);
        }
    });
});
