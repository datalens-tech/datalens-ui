import type {GlobalConfigTsJest, InitialOptionsTsJest} from 'ts-jest';

import {getIgnoredNodeModulesRegexp} from './mappers/ignore-node-modules-mapper';
import {CSS_MAPPER, TYPESCRIPT_ALIASES_MAPPER} from './mappers/moduleNameMappers';
import {UI_GLOBAL_MOCK_PATH} from './mocks';
import {
    TESTING_LIBRARY_SETUP_AFTER_ENV_FILE_PATH,
    TESTING_LIBRARY_SETUP_FILE_PATH,
} from './setup-files';
import {IMAGE_TRANSFORMER} from './transformers';

const tsconfig = require('../tsconfig.jest.json');

export const getJestBaseConfig = (options?: {isUIProject?: boolean}): InitialOptionsTsJest => {
    const transform = {};
    const globals: GlobalConfigTsJest = {
        'ts-jest': {
            tsconfig: 'tsconfig.jest.json',
            isolatedModules: true,
        },
    };
    const moduleNameMapper = {
        ...TYPESCRIPT_ALIASES_MAPPER,
    };

    const setupFiles: string[] = [];
    const setupFilesAfterEnv: string[] = [];
    const transformIgnorePatterns: string[] = [];

    if (options?.isUIProject) {
        Object.assign(transform, IMAGE_TRANSFORMER);
        Object.assign(moduleNameMapper, CSS_MAPPER);

        setupFiles.push(TESTING_LIBRARY_SETUP_FILE_PATH, UI_GLOBAL_MOCK_PATH);
        setupFilesAfterEnv.push(TESTING_LIBRARY_SETUP_AFTER_ENV_FILE_PATH);

        transformIgnorePatterns.push(getIgnoredNodeModulesRegexp());
    }

    return {
        preset: 'ts-jest/presets/js-with-ts',
        modulePaths: [tsconfig.compilerOptions.baseUrl],
        testMatch: ['**/*.test.[jt]s?(x)'],
        moduleNameMapper,
        transform,
        setupFiles,
        setupFilesAfterEnv,
        transformIgnorePatterns,
        globals,
    };
};
