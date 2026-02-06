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

    const converted: Source = {
        ...source,
        apiConnectionId: aliasTo.apiConnectionId,
        method: source.method || 'GET',
        path: path || '/',
        url: '',
    };

    delete (converted as {url?: string}).url;

    return converted;
}
