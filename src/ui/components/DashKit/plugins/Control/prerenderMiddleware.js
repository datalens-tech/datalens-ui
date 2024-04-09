import isPlainObject from 'lodash/isPlainObject';
import moment from 'moment';

export const DATE_FORMAT = 'YYYY-MM-DD';

const intervalToString = (from, to) => {
    return `__interval_${moment(from).format(DATE_FORMAT)}_${moment(to).format(DATE_FORMAT)}`;
};

const dateToString = (date) => {
    return moment(date).format(DATE_FORMAT);
};

const getAfterDate = (first, second) => (moment(first).isAfter(second) ? first : second);

const getBeforeDate = (first, second) => (moment(first).isAfter(second) ? second : first);

// eslint-disable-next-line complexity
const formatDefaultToString = (defaultValue, source) => {
    const {acceptableValues, isRange} = source;
    const {type, value: {from, to} = {}} = defaultValue;
    switch (type) {
        case 'acceptableFrom': // always isRange = false
            return acceptableValues && acceptableValues.from
                ? dateToString(acceptableValues.from)
                : '';
        case 'acceptableTo': // always isRange = false
            return acceptableValues && acceptableValues.to ? dateToString(acceptableValues.to) : '';
        case 'acceptableFullInterval': // always isRange = true
            return acceptableValues && acceptableValues.from && acceptableValues.to
                ? intervalToString(acceptableValues.from, acceptableValues.to)
                : '';
        case 'date':
            if (isRange) {
                const fromDate =
                    acceptableValues && acceptableValues.from
                        ? getAfterDate(from, acceptableValues.from)
                        : from;
                const toDate =
                    acceptableValues && acceptableValues.to
                        ? getBeforeDate(to, acceptableValues.to)
                        : to;
                return intervalToString(fromDate, toDate);
            } else {
                return dateToString(from);
            }
        case 'relative': // what to do with acceptableValues?
            if (isRange) {
                return intervalToString(
                    moment().subtract(from, 'days'),
                    moment().subtract(to, 'days'),
                );
            } else {
                return dateToString(moment().subtract(from, 'days'));
            }
        default:
            return '';
    }
};

export function prerenderMiddleware(item) {
    const {defaults = {}, data = {}} = item;
    const defaultsKeys = Object.keys(defaults);

    if (defaultsKeys.some((key) => isPlainObject(defaults[key]))) {
        const {source} = data;
        return {
            ...item,
            defaults: defaultsKeys.reduce((acc, key) => {
                const value = defaults[key];
                acc[key] = isPlainObject(value) ? formatDefaultToString(value, source) : value;
                return acc;
            }, {}),
        };
    }
    return item;
}
