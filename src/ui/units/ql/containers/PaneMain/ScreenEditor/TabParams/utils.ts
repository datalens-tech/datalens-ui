import {DateTime} from 'luxon';

import {QLParamType, resolveRelativeDate} from '../../../../../../../shared';
import {LUXON_FORMATS} from '../../../../../../components/RelativeDatesPicker/constants';

export const resolveAndFormatDate = (date: string, type: QLParamType) => {
    const resolvedDate = resolveRelativeDate(date);

    return DateTime.fromISO(resolvedDate || date, {
        zone: 'utc',
    }).toFormat(type === QLParamType.Datetime ? LUXON_FORMATS.DATE_TIME : LUXON_FORMATS.DATE);
};
