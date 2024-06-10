import type {ServerCommonSharedExtraSettings, ServerField} from '../../../../../../../shared';
import {IndicatorTitleMode, getFakeTitleOrTitle} from '../../../../../../../shared';

export function getTitle(
    extraSettings: ServerCommonSharedExtraSettings | undefined,
    field: ServerField,
) {
    const mode = extraSettings?.indicatorTitleMode;
    switch (mode) {
        case IndicatorTitleMode.Hide: {
            return '';
        }
        case IndicatorTitleMode.Manual: {
            return extraSettings?.title || '';
        }
        case IndicatorTitleMode.ByField:
        default: {
            return getFakeTitleOrTitle(field);
        }
    }
}
