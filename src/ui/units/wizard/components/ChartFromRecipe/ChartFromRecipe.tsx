import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import {ChartWrapper} from 'ui/components/Widgets/Chart/ChartWidgetWithProvider';
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
            const wizardConfig = await getWizardConfigFromRecipe({recipe});
            const entryType = getChartTypeByVisualizationId(wizardConfig.visualization.id);
            setEntryConfig({
                type: entryType,
                data: {
                    shared: wizardConfig,
                },
            } as unknown as ConfigNode);
        })();
    }, [recipe]);

    if (!entryConfig) {
        return <Loader />;
    }

    return <ChartWrapper usageType="chart" config={entryConfig} forwardedRef={chartRef} />;
});

ChartFromRecipe.displayName = 'ChartFromRecipe';
