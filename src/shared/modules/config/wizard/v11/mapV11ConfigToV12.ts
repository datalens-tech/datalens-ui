import set from 'lodash/set';

import type {V11ChartsConfig, V12ChartsConfig} from '../../../../types';
import {ChartsConfigVersion, MARKUP_TYPE} from '../../../../types';

function replaceObjectField(item: unknown) {
    if (item && typeof item === 'object') {
        if ('isMarkdown' in item) {
            delete item['isMarkdown'];
            set(item, 'markupType', MARKUP_TYPE.markdown);
        } else {
            Object.values(item).forEach(replaceObjectField);
        }
    }
}

export const mapV11ConfigToV12 = (config: V11ChartsConfig): V12ChartsConfig => {
    replaceObjectField(config);

    return {
        ...config,
        version: ChartsConfigVersion.V12,
    };
};
