import {
    MarkupItem,
    ServerCommonSharedExtraSettings,
    ServerField,
    getFakeTitleOrTitle,
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
    if (typeof value === 'object') {
        return {value};
    } else {
        const size = (extraSettings && extraSettings.metricFontSize) || 'm';
        const color = (extraSettings && extraSettings.metricFontColor) || 'rgb(77, 162, 241)';

        let title;

        if (extraSettings && extraSettings.title && extraSettings.titleMode === 'show') {
            title = extraSettings.title;
        } else {
            title = getFakeTitleOrTitle(measure);
        }

        return {
            value: {
                type: 'concat',
                className: `markup-indicator_size_${size}`,
                children: [
                    {
                        className: 'markup-indicator-title',
                        type: 'text',
                        content: title,
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
                            content: String(value),
                        },
                    },
                ],
            },
        };
    }
};
