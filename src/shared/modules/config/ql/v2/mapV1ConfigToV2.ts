import type {QlConfigV1} from '../../../../types/config/ql/v1';
import type {QlConfigV2} from '../../../../types/config/ql/v2';
import type {GetTranslationFn} from '../../../../types/language';

export const mapV1ConfigToV2 = (config: QlConfigV1, _i18n: GetTranslationFn): QlConfigV2 => {
    return config as unknown as QlConfigV2;
};
