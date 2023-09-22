import {ChartsConfigVersion} from '../types';

describe('wizard', () => {
    describe('versions', () => {
        it('enum should contains only string values', () => {
            const versions = Object.values(ChartsConfigVersion);

            for (const version of versions) {
                expect(typeof version).toBe('string');
            }
        });
    });
});
