import {CommonSharedExtraSettings, LabelsPositions} from 'shared';

const ITEM_TYPES = {
    DIMENSIONS: new Set(['DIMENSION']),
    MEASURES: new Set(['MEASURE']),
    PSEUDO: new Set(['PSEUDO']),
    DIMENSIONS_AND_PSEUDO: new Set(['DIMENSION', 'PSEUDO']),
    MEASURES_AND_PSEUDO: new Set(['MEASURE', 'PSEUDO']),
    DIMENSIONS_AND_MEASURES: new Set(['DIMENSION', 'MEASURE']),
    ALL: new Set(['DIMENSION', 'MEASURE', 'PSEUDO']),
    NIL: new Set([]),
    PARAMETERS: new Set(['PARAMETERS']),
};

const CONFLICT_TOOLTIPS = {
    'not-existing': 'label_field-not-exist',
    'not-existing-ql': 'label_field-not-exist-in-query',
    'wrong-type': 'label_field-has-wrong-type',
    invalid: 'label_field-invalid',
    'link-failed': 'label_link-failed',
    'more-than-one-hierarchy': 'label_field-more-than-one-hierarchy',
};

const DATASET_ERRORS = {
    '403-dataset': 'label_error-dataset-no-access-rights',
    '403-connection': 'label_error-connection-no-access-rights',
    404: 'label_error-dataset-not-found',
    500: 'label_error-dataset-server-error',
    UNKNOWN: 'label_error-dataset-unknown-error',
};

const AVAILABLE_FIELD_TYPES = [
    'string',
    'integer',
    'float',
    'date',
    'datetime',
    'genericdatetime',
    'datetimetz',
    'boolean',
    'geopoint',
    'geopolygon',
];

const DATE_MODES = {
    DEFAULT: 'continuous',
    CONINUOUS: 'continuous',
    DISCRETE: 'discrete',
} as const;

const HIDE_LABEL_MODES = {
    DEFAULT: 'show',
    HIDE: 'hide',
    SHOW: 'show',
};

const AVAILABLE_LABEL_MODES = ['absolute', 'percent'];

const PREFIX = '/wizard';

const CLIENT_SIDE_FIELD_PROPS = [
    'local',
    'quickFormula',
    'format',
    'grouping',
    'originalDateCast',
    'originalSource',
    'originalTitle',
    'originalFormula',
    'fakeTitle',
    'datasetId',
    'asPseudo',
    'columnSettings',
    'backgroundSettings',
    'barsSettings',
];

const PRIMITIVE_DATA_TYPES = new Set([
    'integer',
    'uinteger',
    'float',
    'date',
    'datetime',
    'genericdatetime',
    'datetimetz',
    'boolean',
    'string',
    'array_str',
    'array_int',
    'array_float',
]);

const PRIMITIVE_DATA_TYPES_AND_HIERARCHY = new Set([...PRIMITIVE_DATA_TYPES, 'hierarchy']);

const DEFAULT_PAGE_ROWS_LIMIT = 100;

const DEFAULT_FLAT_TABLE_EXTRA_SETTINGS = {
    pagination: 'on',
    limit: DEFAULT_PAGE_ROWS_LIMIT,
} as const;

const DEFAULT_DONUT_EXTRA_SETTINGS = {
    totals: 'on',
} as const;

export const DEFAULT_BAR_EXTRA_SETTINGS: Partial<CommonSharedExtraSettings> = {
    labelsPosition: LabelsPositions.Outside,
} as const;

const AREA_OR_AREA100P = new Set(['area', 'area100p']);

const DEFAULT_DATE_FORMAT = 'DD.MM.YYYY';
const DEFAULT_DATETIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';

const WIZARD_DATASET_ID_PARAMETER_KEY = '__datasetId';

const DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG = {
    '400': 33,
    '500': 30,
    '700': 27,
    '800': 26,
    '900': 25,
    '1000': 24,
    '1100': 23,
    '1200': 22,
    '1300': 21,
    '1400': 20,
};

export {
    ITEM_TYPES,
    CONFLICT_TOOLTIPS,
    DATASET_ERRORS,
    AVAILABLE_FIELD_TYPES,
    DATE_MODES,
    HIDE_LABEL_MODES,
    AVAILABLE_LABEL_MODES,
    PREFIX,
    CLIENT_SIDE_FIELD_PROPS,
    PRIMITIVE_DATA_TYPES,
    PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
    DEFAULT_PAGE_ROWS_LIMIT,
    DEFAULT_FLAT_TABLE_EXTRA_SETTINGS,
    DEFAULT_DONUT_EXTRA_SETTINGS,
    AREA_OR_AREA100P,
    DEFAULT_DATE_FORMAT,
    DEFAULT_DATETIME_FORMAT,
    WIZARD_DATASET_ID_PARAMETER_KEY,
    DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG,
};

export const CLUSTERS_DATE_FORMAT_DATE = 'MM/DD/YYYY';
