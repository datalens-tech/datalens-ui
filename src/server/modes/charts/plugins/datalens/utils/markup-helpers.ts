export const prepareMetricObject = ({
    size,
    title,
    color,
    value,
}: {
    size: string;
    title: string;
    color: string;
    value: string;
}) => {
    return {
        value: {
            type: 'concat',
            className: `markup-metric markup-metric_size_${size}`,
            children: [
                {
                    className: 'markup-metric-title',
                    type: 'text',
                    content: title,
                },
                {
                    type: 'color',
                    color,
                    content: {
                        className: 'markup-metric-value',
                        type: 'text',
                        content: value,
                    },
                },
            ],
        },
    };
};
