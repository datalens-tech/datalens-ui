import dayjs from '@gravity-ui/date-utils/build/dayjs';

export function getUtcDateTime(value: string) {
    return dayjs.utc(value);
}
