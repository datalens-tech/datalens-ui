import geopoint from './geopoint';
import {PrepareFunctionArgs} from './types';

export default (options: PrepareFunctionArgs) => geopoint(options, {isClusteredPoints: true});
