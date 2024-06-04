import type {AppInstallation, MinimumEntryFields} from 'shared';
import type {Endpoints} from 'shared/endpoints';

export type GetUIEntryRouteArgs = {
    entry: MinimumEntryFields;
    origin: URL['origin'];
    installationType: AppInstallation;
    endpoints: Endpoints['ui'];
};
