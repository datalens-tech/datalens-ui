import {pathsToModuleNameMapper} from 'ts-jest';

import {UI_STYLE_MOCK_PATH} from '../mocks';

const tsconfig = require('../../tsconfig.jest.json');

export const TYPESCRIPT_ALIASES_MAPPER = pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: '<rootDir>',
});

export const CSS_MAPPER = {
    '\\.(scss|css)$': UI_STYLE_MOCK_PATH,
};
