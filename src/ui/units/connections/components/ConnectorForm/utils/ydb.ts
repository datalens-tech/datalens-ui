import {FieldKey} from '../../../constants';

export const parseGrpcEndpoint = (enpdoint = '') => {
    try {
        const url = new URL(enpdoint);
        const [host, port] = (url.host || url.pathname).replace(/\//g, '').split(':');
        const dbName = url.searchParams.get('database') || '';

        return {[FieldKey.Host]: host, [FieldKey.Port]: port, [FieldKey.DbName]: dbName};
    } catch (_error) {
        return {[FieldKey.Host]: '', [FieldKey.Port]: '', [FieldKey.DbName]: ''};
    }
};
