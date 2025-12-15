import type {AppPluginsConfig} from '../registry/utils/register-app-plugins';
import {registerAppPlugins} from '../registry/utils/register-app-plugins';
import {initChartKitSettings} from '../libs/DatalensChartkit/ChartKit/init';

type DatalensApplicationConfig = {
    pluginsConfig?: AppPluginsConfig;
    registerPlugins?: () => void;
    setupAppConfiguration?: () => void;
};
export const renderDatalens = (render: () => void, config: DatalensApplicationConfig) => {
    registerAppPlugins(config.pluginsConfig);

    const {registerPlugins} = config;

    if (registerPlugins) {
        registerPlugins();
    }

    initChartKitSettings();

    render();
};
