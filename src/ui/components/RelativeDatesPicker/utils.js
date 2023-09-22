import {I18n} from 'i18n';
import {DateTime} from 'luxon';
import {getParsedIntervalDates, getParsedRelativeDate, resolveRelativeDate} from 'shared';
import {SCALES} from 'shared/constants/datepicker/relative-datepicker';

import {CONTROLS, INTERVAL_PREFIX, POSTFIXES, PRESETS} from './constants';

const i18n = I18n.keyset('component.relative-dates-picker.view');

export const createPresetItem = ({start, end, range}) => ({
    start,
    end,
    id: `last_${start}_days`,
    // don't show the includeCurrentDay checkbox for the "Today" and "Yesterday" presets
    currentDaySetup: !['-0', '-1'].includes(start),
    get title() {
        return i18n(`label_preset-${this.id}${range ? '-range' : ''}`);
    },
});

export const getPresetList = (range) => {
    return PRESETS.map((preset) => {
        preset.range = range;

        return createPresetItem(preset);
    });
};

export const cretateSelectItems = (values, titlePrefix, count) => {
    return values.map((value) => ({
        value,
        content: i18n(`${titlePrefix}${value}`, {count}),
        qa: SCALES[value],
    }));
};

export const computeRelativeDate = ({sign, amount, scale}) => {
    return `__relative_${sign}${amount}${scale}`;
};

export const getDatesFromValue = (value) => {
    if (typeof value !== 'string') {
        return [];
    }

    if (value.indexOf(INTERVAL_PREFIX) !== -1) {
        return getParsedIntervalDates(value) || [];
    }

    // assume that date is single relative or absolute
    return [value, null];
};

const resolvePresetToDates = ({preset, controls, includeCurrentDay}) => {
    const {start, end, currentDaySetup} = preset;
    const excludeCurrentDay = currentDaySetup && !includeCurrentDay;

    return Object.entries(controls).reduce((dates, [controlType], index) => {
        if (!dates[index]) {
            dates[index] = {};
        }

        const now = DateTime.utc();
        const pivot = excludeCurrentDay ? now.plus({days: -1}) : now;
        const days = Number(controlType === CONTROLS.START ? start : end);

        dates[index].absolute =
            controlType === CONTROLS.START
                ? pivot.plus({days}).startOf('day')
                : pivot.plus({days}).endOf('day');

        dates[index].relative =
            controlType === CONTROLS.START
                ? `__relative_${excludeCurrentDay ? days - 1 : start}d`
                : `__relative_${excludeCurrentDay ? days - 1 : end}d`;

        return dates;
    }, []);
};

export const getResolvedDatesData = ({preset, controls, includeCurrentDay}) => {
    const [
        {absolute: absoluteStartDate, relative: relativeStartDate},
        {absolute: absoluteEndDate, relative: relativeEndDate},
    ] = resolvePresetToDates({preset, controls, includeCurrentDay});

    const absoluteStart = absoluteStartDate.toString();
    const absoluteEnd = absoluteEndDate.toString();
    const [signStart, amountStart, scaleStart] = getParsedRelativeDate(relativeStartDate);
    const [signEnd, amountEnd, scaleEnd] = getParsedRelativeDate(relativeEndDate);

    return {
        absoluteStart,
        absoluteEnd,
        signStart,
        signEnd,
        amountStart,
        amountEnd,
        scaleStart,
        scaleEnd,
    };
};

export const getFieldKey = (fieldType, controlType) => {
    const postfix = controlType === CONTROLS.START ? POSTFIXES.START : POSTFIXES.END;

    return `${fieldType}${postfix}`;
};

export const isDateTimeInvalid = ({dateTime, min, max}) => {
    return Boolean(dateTime.invalid || dateTime < min || dateTime > max);
};

export const createISODateTimeFromRelative = (value, rangePart) => {
    const ISOString = resolveRelativeDate(value, rangePart);

    return DateTime.fromISO(ISOString, {zone: 'utc'});
};

export const getQaAttribute = (qa, controlType) => {
    return controlType === CONTROLS.START ? qa.start : qa.end;
};
