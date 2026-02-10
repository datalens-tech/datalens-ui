import type {Source, SourceConfig} from '../../types';

export function shouldUseAlias(source: Source, sourceConfig: SourceConfig): boolean {
    if (!sourceConfig.aliasTo) {
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

    // Use source method if specified, otherwise use first allowed method from config
    // Source only supports GET and POST, so filter to those
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
