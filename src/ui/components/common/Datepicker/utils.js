import {I18n} from 'i18n';
import {DateTime} from 'luxon';

import {MINUTES_IN_HOUR} from './constants';

const i18n = I18n.keyset('components.common.Datepicker');

const FORMAT_LETTERS = ['y', 'M', 'd', 'h', 'H', 'm', 's', 'S'];

export function createDateTime({date, zone}) {
    if (!date) {
        return undefined;
    }

    const type = typeof date;
    let dateTime;

    switch (type) {
        case 'string': {
            dateTime = DateTime.fromISO(date, {zone});

            break;
        }
        case 'number': {
            dateTime = DateTime.fromMillis(date, {zone});

            break;
        }
    }

    return dateTime;
}

export function getPlaceholder(format) {
    return format
        .split('')
        .map((letter) => {
            return FORMAT_LETTERS.includes(letter) ? i18n(`placeholder_letter_${letter}`) : letter;
        })
        .join('');
}

export function getSearchText({from, to, format, emptyValueText, range, required}) {
    switch (true) {
        case Boolean(!range && from): {
            return `${from.toFormat(format)}`;
        }
        case Boolean(from && !to): {
            return `${from.toFormat(format)} - ${emptyValueText ? emptyValueText : ''}`;
        }
        case Boolean(from && to): {
            return `${from.toFormat(format)} - ${to.toFormat(format)}`;
        }
        case required: {
            return i18n('value_required');
        }
        case Boolean(range): {
            return emptyValueText ? `${emptyValueText} - ${emptyValueText}` : '';
        }
        default: {
            return emptyValueText || '';
        }
    }
}

export function getZone(offset) {
    if (!offset && offset !== 0) {
        return DateTime.local().zoneName;
    }

    const offsetHours = Math.round(offset / MINUTES_IN_HOUR);

    if (offsetHours === 0) {
        return 'UTC';
    }

    return `UTC${offsetHours > 0 ? '+' : ''}${offsetHours}`;
}

export function isValidDate(dateTime) {
    if (!dateTime) {
        return false;
    }

    return dateTime.isValid;
}

// eslint-disable-next-line consistent-return
export function getDefaultPreset({zone, activeTab, range}) {
    switch (activeTab) {
        case 'day': {
            if (range) {
                return [
                    {
                        title: () => i18n('preset_day_7'),
                        start: DateTime.fromObject({zone}).plus({day: -6}).startOf('day'),
                        end: DateTime.fromObject({zone}),
                    },
                    {
                        title: () => i18n('preset_day_30'),
                        start: DateTime.fromObject({zone}).plus({day: -29}).startOf('day'),
                        end: DateTime.fromObject({zone}),
                    },
                    {
                        title: () => i18n('preset_day_90'),
                        start: DateTime.fromObject({zone}).plus({day: -89}).startOf('day'),
                        end: DateTime.fromObject({zone}),
                    },
                    {
                        title: () => i18n('preset_day_365'),
                        start: DateTime.fromObject({zone}).plus({day: -364}).startOf('day'),
                        end: DateTime.fromObject({zone}),
                    },
                ];
            }

            return [
                {
                    title: () => i18n('preset_day_today'),
                    start: DateTime.fromObject({zone}).startOf('day'),
                    end: DateTime.fromObject({zone}),
                },
                {
                    title: () => i18n('preset_day_yesterday'),
                    start: DateTime.fromObject({zone}).plus({day: -1}).startOf('day'),
                    end: DateTime.fromObject({zone}).plus({day: -1}),
                },
                {
                    title: () => i18n('preset_day_two_days_ago'),
                    start: DateTime.fromObject({zone}).plus({day: -2}).startOf('day'),
                    end: DateTime.fromObject({zone}).plus({day: -2}),
                },
            ];
        }
        case 'week': {
            return [
                {
                    title: () => i18n('preset_week_current'),
                    start: DateTime.fromObject({zone}).startOf('week'),
                    end: DateTime.fromObject({zone}).endOf('week'),
                },
                {
                    title: () => i18n('preset_week_past'),
                    start: DateTime.fromObject({zone}).startOf('week').plus({day: -7}),
                    end: DateTime.fromObject({zone}).startOf('week').plus({day: -1}),
                },
            ];
        }
        case 'month': {
            return [
                {
                    title: () => i18n('preset_current'),
                    start: DateTime.fromObject({zone}).startOf('month'),
                    end: DateTime.fromObject({zone}).endOf('month'),
                },
                {
                    title: () => i18n('preset_past'),
                    start: DateTime.fromObject({zone})
                        .startOf('month')
                        .plus({day: -1})
                        .startOf('month'),
                    end: DateTime.fromObject({zone}).startOf('month').plus({day: -1}),
                },
            ];
        }
        case 'quarter': {
            return [
                {
                    title: () => i18n('preset_current'),
                    start: DateTime.fromObject({zone}).startOf('quarter'),
                    end: DateTime.fromObject({zone}).endOf('quarter'),
                },
                {
                    title: () => i18n('preset_past'),
                    start: DateTime.fromObject({zone})
                        .startOf('quarter')
                        .plus({day: -1})
                        .startOf('quarter'),
                    end: DateTime.fromObject({zone}).startOf('quarter').plus({day: -1}),
                },
            ];
        }
        case 'year': {
            return [
                {
                    title: () => i18n('preset_current'),
                    start: DateTime.fromObject({zone}).startOf('year'),
                    end: DateTime.fromObject({zone}).endOf('year'),
                },
                {
                    title: () => i18n('preset_past'),
                    start: DateTime.fromObject({zone})
                        .startOf('year')
                        .plus({day: -1})
                        .startOf('year'),
                    end: DateTime.fromObject({zone}).startOf('year').plus({day: -1}),
                },
            ];
        }
    }
}

export function getHashedData(data) {
    return JSON.stringify(data);
}

export function resolveDates({from, to}) {
    let resolveFrom = from;
    let resolveTo = to;
    const isFromValid = isValidDate(resolveFrom);
    const isToValid = isValidDate(resolveTo);

    if (isFromValid && isToValid && resolveTo < resolveFrom) {
        [resolveFrom, resolveTo] = [resolveTo, resolveFrom];
    }

    if (!isFromValid && isToValid) {
        [resolveFrom, resolveTo] = [resolveTo, resolveFrom];
    }

    resolveFrom = isValidDate(resolveFrom) ? resolveFrom : undefined;
    resolveTo = isValidDate(resolveTo) ? resolveTo : undefined;

    return [resolveFrom, resolveTo];
}

export function checkBrowser() {
    const agent = navigator.userAgent;

    if (
        agent.indexOf('Firefox') !== -1 &&
        parseFloat(agent.substring(agent.indexOf('Firefox') + 8)) >= 3.6
    ) {
        return 'Firefox';
    } else if (
        agent.indexOf('Safari') !== -1 &&
        agent.indexOf('Version') !== -1 &&
        parseFloat(agent.substring(agent.indexOf('Version') + 8).split(' ')[0]) >= 5
    ) {
        return 'Safari';
    }

    return 'Good Browser';
}

export function getListWithoutNullableValues(...args) {
    return args.filter(Boolean);
}

export function hasTimeUnitsInFormat(format) {
    return /H|h|m|s/.test(format);
}

export const fillEmptyToDate = (from) => {
    const diff = from.toUTC().startOf('day').diff(from).toMillis();

    // if "from" is the beginning of the day, then for "to" put the end of the day
    return diff === 0 ? from.toUTC().endOf('day') : from;
};
