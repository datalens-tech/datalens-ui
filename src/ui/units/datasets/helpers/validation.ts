export type FormValidationError = {
    name: string;
    type: string;
};

export const VALIDATION_ERROR = {
    // Yup constants
    REQUIRED: 'required',
    TYPE_ERROR: 'typeError',
    // DataLens Constants
    HAS_DUPLICATES: 'hasDuplicates',
    HAS_DUPLICATED_TITLES: 'hasDuplicatedTitles',
};
