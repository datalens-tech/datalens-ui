import {WizardVisualizationId} from '../../../../constants';
import type {V5ChartsConfig, V6ChartsConfig} from '../../../../types';
import {ChartsConfigVersion} from '../../../../types';
import {isMeasureName} from '../../../wizard-helpers';

export const mapV5ConfigToV6 = (config: V5ChartsConfig): V6ChartsConfig => {
    const updateSortFields = (config.sort || []).filter((field) => {
        if (config.visualization.id === WizardVisualizationId.PivotTable) {
            return !isMeasureName(field);
        }

        return true;
    });

    return {
        ...config,
        sort: updateSortFields,
        version: ChartsConfigVersion.V6,
    };
};
