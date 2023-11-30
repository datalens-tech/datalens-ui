import type {QLEntryDataShared} from '../../../../types';
import {QlConfigVersions} from '../../../../types/ql/versions';
import {mapQlConfigToLatestVersion} from '../mapQlConfigToLatestVersion';

describe('mapQlConfigToLatestVersion', () => {
    it('should return config of the latest version', () => {
        const versions = Object.values(QlConfigVersions);

        const latest = versions[versions.length - 1];

        const config = {} as QLEntryDataShared;

        const latestConfig = mapQlConfigToLatestVersion(config);

        expect(latestConfig.version).toEqual(latest);
    });

    it('should use only string versions', () => {
        const versions = Object.values(QlConfigVersions);

        for (const version of versions) {
            expect(typeof version).toBe('string');
        }
    });
});
