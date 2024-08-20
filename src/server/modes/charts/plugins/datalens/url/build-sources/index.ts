import {registry} from '../../../../../../registry';

import {buildSourcesPrivate} from './build-sources';
import type {SourceRequests, SourcesArgs} from './types';

export const buildSources = (args: SourcesArgs): SourceRequests => {
    const getAvailablePalettesMap = registry.common.functions.get('getAvailablePalettesMap');
    return buildSourcesPrivate({...args, palettes: getAvailablePalettesMap()});
};
