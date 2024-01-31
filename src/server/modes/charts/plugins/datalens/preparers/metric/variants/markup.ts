import {ServerCommonSharedExtraSettings} from '../../../../../../../../shared';

export const prepareMarkupMetricVariant = ({
    value,
}: {
    measure: any;
    value: string | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
}) => {
    return {value};
};
