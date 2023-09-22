import type {Config} from '@jest/types';

import {getJestBaseConfig} from './jest/base-config';

const jestConfig: Config.InitialOptions = {
    projects: [
        {
            displayName: 'UI',
            testEnvironment: 'jsdom',
            roots: ['<rootDir>/src/ui'],
            ...getJestBaseConfig({isUIProject: true}),
        },
        {
            displayName: 'Shared',
            testEnvironment: 'node',
            roots: ['<rootDir>/src/shared'],
            ...getJestBaseConfig(),
        },
        {
            displayName: 'Server',
            testEnvironment: 'node',
            roots: ['<rootDir>/src/server'],
            ...getJestBaseConfig(),
        },
    ],
};

export default jestConfig;
