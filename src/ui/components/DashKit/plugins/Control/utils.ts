import {DashTabItemControlDataset, DashTabItemControlManual} from 'shared/types/dash';
import {Feature} from 'shared/types/feature';
import Utils from 'ui/utils/utils';

import {ValidationErrorData} from './types';

export const isValidRequiredValue = ({required, value}: ValidationErrorData) => {
    const isRequired = Utils.isEnabledFeature(Feature.SelectorRequiredValue) && required;

    const isEmptyArray = Array.isArray(value) && !value.length;
    const isEmptyDateObject =
        !Array.isArray(value) && typeof value === 'object' && (!value.from || !value.to);

    if (!value || isEmptyArray || isEmptyDateObject) {
        return isRequired;
    }

    return false;
};

export const getRequiredLabel = ({title, required}: {title: string; required?: boolean}) => {
    return Utils.isEnabledFeature(Feature.SelectorRequiredValue) && required ? `${title}*` : title;
};

export const getLabels = ({
    controlData,
}: {
    controlData: DashTabItemControlDataset | DashTabItemControlManual;
}) => {
    const title = controlData.title;
    const {showTitle, showInnerTitle, innerTitle, required} = controlData.source;

    const label = showTitle ? getRequiredLabel({title, required}) : '';
    let innerLabel = '';
    if (showInnerTitle && innerTitle) {
        // if title isn't shown than trying to add asterisk to innerLabel
        innerLabel = showTitle ? innerTitle : getRequiredLabel({title: innerTitle, required});
    }

    return {label, innerLabel};
};
