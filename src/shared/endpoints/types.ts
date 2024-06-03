import type {AppEnvironment, AppInstallation} from '../constants';

export type Endpoints = {
    api: Record<string, string>;
    ui: Record<string, string>;
};

export type EnvironmentEndpoints = {
    [key in AppEnvironment]?: Endpoints;
};

export type InstallationEndpoints = {
    [key in AppInstallation]: EnvironmentEndpoints;
};

export type SourceEndpoints = {
    [key in AppEnvironment]?: string;
};
