import type {ServerField} from '../../../../../../../../../../shared';

import {MOCKED_DIMENSION_FIELD} from './common.mock';

export const MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING = {
    ...MOCKED_DIMENSION_FIELD,
    subTotalsSettings: {enabled: true},
} as ServerField;
