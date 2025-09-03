import {ChartkitHandlers, getXAxisMode} from '../../../../../../../../shared';
import type {ServerChartsConfig, ServerPlaceholder} from '../../../../../../../../shared';

import {getAxisType} from './getAxisType';
import {isAxisLabelDateFormat} from './isAxisLabelDateFormat';

interface AddAxisFormatterProps {
    axisConfig: Record<string, any>;
    placeholder?: ServerPlaceholder;
    chartConfig?: Partial<ServerChartsConfig>;
    otherwiseFormatter?: string;
}

export const addAxisFormatter = (props: AddAxisFormatterProps) => {
    const {axisConfig, otherwiseFormatter, chartConfig, placeholder} = props;
    if (!axisConfig || !placeholder) {
        return;
    }
    const field = placeholder?.items?.[0];
    const axisMode = chartConfig ? getXAxisMode({config: chartConfig}) : undefined;
    const axisType = getAxisType({
        field: field,
        settings: placeholder?.settings,
        axisMode: axisMode,
    });

    const axisLabelDateFormat = isAxisLabelDateFormat(placeholder?.settings, field, axisType);
    const formatter = axisLabelDateFormat
        ? ChartkitHandlers.WizardDatetimeAxisFormatter
        : otherwiseFormatter;
    const format = axisLabelDateFormat ? placeholder?.settings?.axisLabelDateFormat : undefined;
    axisConfig.labels = {
        ...(axisConfig.labels ?? {}),
        formatter,
        format,
    };
};
