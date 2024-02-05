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
                        className: 'markup-indicator-title',
                        type: 'text',
                        content: measure.fakeTitle || measure.title,
                    },
                    {
                        type: 'br',
                    },
                    {
                        className: 'markup-indicator-value',
                        type: 'text',
                        content: value,
                    },
                ],
            },
        };
    } else {
        return {value};
    }
};
