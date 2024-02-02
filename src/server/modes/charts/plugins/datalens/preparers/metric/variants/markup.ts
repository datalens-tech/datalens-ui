import {
    MarkupItem,
    ServerCommonSharedExtraSettings,
    ServerField,
} from '../../../../../../../../shared';

export const prepareMarkupMetricVariant = ({
    measure,
    value,
}: {
    measure: ServerField;
    value: string | MarkupItem | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
}) => {
    if (typeof value === 'string') {
        return {
            value: {
                type: 'concat',
                children: [
                    {
                        type: 'bold',
                        content: {
                            type: 'text',
                            content: measure.fakeTitle || measure.title,
                        },
                    },
                    {
                        type: 'br',
                    },
                    {
                        type: 'size',
                        size: '40px',
                        content: {
                            type: 'color',
                            color: 'blue',
                            content: {
                                type: 'text',
                                content: value,
                            },
                        },
                    },
                ],
            },
        };
    } else {
        return {value};
    }
};
