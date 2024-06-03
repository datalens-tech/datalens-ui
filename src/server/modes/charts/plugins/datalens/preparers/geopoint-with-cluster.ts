import geopoint from './geopoint';
import type {PrepareFunctionArgs} from './types';

export default (options: PrepareFunctionArgs) => geopoint(options, {isClusteredPoints: true});
