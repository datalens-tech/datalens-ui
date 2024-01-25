import {DashTabItemControlDataset, DashTabItemControlManual} from 'shared/types/dash';
import {Feature} from 'shared/types/feature';
import Utils from 'ui/utils/utils';

import {ValidationErrorData} from './types';

export const isValidationError = ({required, value}: ValidationErrorData) => {
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

    let label = '';
    let innerLabel = '';
    if (showTitle) {
        // if showing title than don't add possible asterisk to innerLabel
        label = getRequiredLabel({title, required});
        innerLabel = showInnerTitle ? innerTitle || '' : '';
    } else {
        // if not showing title that trying to add asterisk to innerLabel
        label = '';
        innerLabel =
            showInnerTitle && innerTitle ? getRequiredLabel({title: innerTitle, required}) : '';
    }

    return {label, innerLabel};
};
