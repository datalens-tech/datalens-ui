import type {CONNECTOR_VISIBILITY_MODE, ValueOf} from 'shared';

export type GetIsShowCreateConnectionButton = (
    visibilityMode: ValueOf<typeof CONNECTOR_VISIBILITY_MODE>,
) => boolean;
