import dayjs from '@gravity-ui/date-utils/build/dayjs';

// https://github.com/gravity-ui/date-utils/issues/49
export function getUtcDateTime(value: string) {
    return dayjs.utc(value);
}
