import {
    MarkupItem,
    ServerCommonSharedExtraSettings,
    ServerField,
} from '../../../../../../../../shared';

export const prepareMarkupMetricVariant = ({
    measure,
    value,
    extraSettings,
}: {
    measure: ServerField;
    value: string | MarkupItem | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
}) => {
    if (typeof value === 'string') {
        const size = (extraSettings && extraSettings.metricFontSize) || 'm';
        const color = (extraSettings && extraSettings.metricFontColor) || 'rgb(77, 162, 241)';

        return {
            value: {
                type: 'concat',
                className: `markup-indicator_size_${size}`,
                children: [
                    {
                        className: 'markup-indicator-title',
                        type: 'text',
                        content: measure.fakeTitle || measure.title,
                    },
                    {
                        type: 'br',
                    },
                    {
                        type: 'color',
                        color,
                        content: {
                            className: 'markup-indicator-value',
                            type: 'text',
                            content: value,
                        },
                    },
                ],
            },
        };
    } else {
        return {value};
    }
};
