import {ChartsConfigVersion, type ExtendedChartsConfig} from '../../../../types';
import {mapChartsConfigToLatestVersion} from '../mapChartsConfigToLatestVersion';

describe('mapChartsConfigToLatestVersion', () => {
    // it is necessary to fix the conversion to string, because version 8 was mistakenly a number
    it('should cast number version to string', () => {
        const mockedConfigWithNumericVersion = {version: 8} as unknown as ExtendedChartsConfig;

        const result = mapChartsConfigToLatestVersion(mockedConfigWithNumericVersion);

        expect(result).toEqual({version: ChartsConfigVersion.V14});
    });
});
