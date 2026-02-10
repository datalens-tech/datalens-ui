import {Feature} from '../../../../../shared/types/feature';
import type {Source, SourceConfig} from '../../types';

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

    const authorization = source.headers?.authorization;
    if (typeof authorization === 'string' && authorization.startsWith('OAuth ')) {
        return false;
    }

    return true;
}

export function convertToAPIConnectorSource(source: Source, sourceConfig: SourceConfig): Source {
    const {aliasTo} = sourceConfig;
    if (!aliasTo) {
        throw new Error('convertToAPIConnectorSource called without aliasTo config');
    }

    // Extract path: '/_startrek/issues?filter=open' -> '/issues?filter=open'
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
    } as Source;

    return converted;
}
