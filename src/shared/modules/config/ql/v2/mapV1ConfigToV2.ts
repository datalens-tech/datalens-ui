import type {QLQueryV1, QlConfigV1} from '../../../../types/config/ql/v1';
import type {QLQueryV2, QlConfigV2} from '../../../../types/config/ql/v2';
import type {GetTranslationFn} from '../../../../types/language';
import {QlConfigVersions} from '../../../../types/ql/versions';

export const mapV1ConfigToV2 = (config: QlConfigV1, i18n: GetTranslationFn): QlConfigV2 => {
    if (!config.queries) {
        return {
            ...config,
            version: QlConfigVersions.V2,
        } as QlConfigV2;
    }

    const mapQuery = (query: QLQueryV1, index: number): QLQueryV2 => {
        return {
            ...query,
            queryName: `${i18n('sql', 'label_query')} ${index + 1}`,
        };
    };

    return {
        ...config,
        version: QlConfigVersions.V2,
        queries: config.queries.map(mapQuery),
    };
};
