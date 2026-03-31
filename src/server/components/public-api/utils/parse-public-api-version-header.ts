import {PUBLIC_API_VERSION_HEADER_LATEST_VALUE} from '../constants';

export const parsePublicApiVersionHeader = ({
    versionHeader,
    versions,
    latestVersion,
}: {
    versionHeader: string | string[] | undefined;
    versions: number[];
    latestVersion: number;
}): number | null => {
    if (versionHeader) {
        const parsedVersion = Number(versionHeader);

        if (versions.includes(parsedVersion)) {
            return parsedVersion;
        }

        if (versionHeader === PUBLIC_API_VERSION_HEADER_LATEST_VALUE) {
            return latestVersion;
        }
    }

    return null;
};
