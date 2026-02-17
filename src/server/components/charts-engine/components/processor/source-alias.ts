import {Feature} from '../../../../../shared/types/feature';
import type {Source, SourceConfig, SourceWithAPIConnector} from '../../types';

type IsEnabledServerFeature = (feature: string) => boolean;

export function shouldUseAlias(
    source: Source,
    sourceConfig: SourceConfig,
    isEnabledServerFeature: IsEnabledServerFeature,
): boolean {
    if (!sourceConfig.aliasTo) {
        return false;
    }

    if (!isEnabledServerFeature(Feature.UseSourceAlias)) {
        return false;
    }

    const authorization = source.headers?.authorization || source.headers?.Authorization;
    if (typeof authorization === 'string' && authorization.startsWith('OAuth ')) {
        return false;
    }

    return true;
}

export function convertToAPIConnectorSource(
    source: Source,
    sourceConfig: SourceConfig,
): SourceWithAPIConnector {
    const {aliasTo} = sourceConfig;
    if (!aliasTo) {
        throw new Error('convertToAPIConnectorSource called without aliasTo config');
    }

    // Extract path: '/_example/issues?filter=open' -> '/issues?filter=open'
    const path = source.url.replace(/^\/_[^/?]+/, '');

    const firstAllowedMethod = sourceConfig.allowedMethods?.[0];
    const defaultMethod: 'GET' | 'POST' =
        firstAllowedMethod === 'GET' || firstAllowedMethod === 'POST' ? firstAllowedMethod : 'GET';

    const {url: _, ...sourceWithoutUrl} = source;
    const converted = {
        ...sourceWithoutUrl,
        apiConnectionId: aliasTo.apiConnectionId,
        method: source.method || defaultMethod,
        path: path || '/',
    } as SourceWithAPIConnector;

    return converted;
}
