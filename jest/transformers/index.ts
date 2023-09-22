const JEST_PATH_TO_IMAGE_TRANSFORMER = '<rootDir>/jest/transformers/image-transformer.js';
const JEST_IMAGE_TRANSFORMER_REGEXP =
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$';

export const IMAGE_TRANSFORMER = {
    [JEST_IMAGE_TRANSFORMER_REGEXP]: JEST_PATH_TO_IMAGE_TRANSFORMER,
};
