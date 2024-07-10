import {extractEntryId, getAvailablePalettesMap, isEntryId} from '../../../../shared';
import {getSourceAuthorizationHeaders} from '../../../components/charts-engine/components/utils';
import {registry} from '../../index';

export const registerCommonPlugins = () => {
    registry.common.functions.register({
        getAvailablePalettesMap,
        getSourceAuthorizationHeaders,
        isEntryId,
        extractEntryId,
    });
};
