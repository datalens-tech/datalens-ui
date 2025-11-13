import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import {ChartWrapper} from 'ui/components/Widgets/Chart/ChartWidgetWithProvider';
import {MenuType} from 'ui/libs/DatalensChartkit/menu/constants';
import type {ConfigNode} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';

import {getChartTypeByVisualizationId} from '../../reducers/preview';
import {type WizardChartRecipe, getWizardConfigFromRecipe} from '../../utils/chart-recipe';

type Props = {
    recipe: WizardChartRecipe;
};

export const ChartFromRecipe = React.memo(({recipe}: Props) => {
    const [entryConfig, setEntryConfig] = React.useState<ConfigNode | null>(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        (async function () {
            /* eslint-disable no-console */
            console.groupEnd();
            console.group('Generate wizard config from recipe');
            console.log('Chart recipe:');
            console.log(recipe);

            const wizardConfig = await getWizardConfigFromRecipe({recipe});
            const entryType = getChartTypeByVisualizationId(wizardConfig.visualization.id);
            setEntryConfig({
                type: entryType,
                data: {
                    shared: wizardConfig,
                    recipe,
                },
            } as unknown as ConfigNode);

            console.log('Wizard config:');
            console.log(wizardConfig);
            console.groupEnd();
            /* eslint-enable no-console */
        })();
    }, [recipe]);

    if (!entryConfig) {
        return <Loader />;
    }

    return (
        <ChartWrapper
            usageType="chart"
            config={entryConfig}
            forwardedRef={chartRef}
            menuType={MenuType.ChartRecipe}
        />
    );
});

ChartFromRecipe.displayName = 'ChartFromRecipe';
