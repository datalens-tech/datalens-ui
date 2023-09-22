import {registerAppPlugins} from '../registry/utils/register-app-plugins';
import {initChartKitSettings} from '../libs/DatalensChartkit/ChartKit/init';

type DatalensApplicationConfig = {
    registerPlugins?: () => void;
    setupAppConfiguration?: () => void;
};
export const renderDatalens = (render: () => void, config: DatalensApplicationConfig) => {
    registerAppPlugins();

    const {registerPlugins} = config;

    if (registerPlugins) {
        registerPlugins();
    }

    initChartKitSettings();

    render();
};
