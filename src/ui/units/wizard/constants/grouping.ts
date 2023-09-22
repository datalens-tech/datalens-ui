const AVAILABLE_DATE_GROUPING_MODES = [
    ['trunc', ['year', 'quarter', 'month', 'week', 'day']],
    ['part', ['year', 'quarter', 'month', 'week', 'day', 'dayofweek']],
];

const AVAILABLE_DATETIME_GROUPING_MODES = [
    ['trunc', ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second']],
    ['part', ['year', 'quarter', 'month', 'week', 'day', 'dayofweek', 'hour', 'minute', 'second']],
];

export {AVAILABLE_DATE_GROUPING_MODES, AVAILABLE_DATETIME_GROUPING_MODES};
