import React from 'react';

import {BucketPaint} from '@gravity-ui/icons';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {CommonSharedExtraSettings} from 'shared';
import {PlaceholderActionQa} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {openDialogMetricColors} from '../../../../../actions/dialog';
import {selectExtraSettings} from '../../../../../selectors/widget';
import PlaceholderComponent from '../Placeholder/Placeholder';

const i18n = I18n.keyset('wizard');

type MetricColorsPlaceholderProps = {
    onUpdate?: () => void;
    isMarkup: boolean;
};

export const MetricColorsPlaceholder: React.FC<MetricColorsPlaceholderProps> = ({
    onUpdate,
    isMarkup,
}) => {
    const dispatch = useDispatch();
    const extraSettings = useSelector(
        (state: DatalensGlobalState) => selectExtraSettings(state) as CommonSharedExtraSettings,
    );

    const handleOpenDialogMetricColors = React.useCallback(() => {
        if (isMarkup) {
            return;
        }
        dispatch(
            openDialogMetricColors({
                extraSettings,
                onApply: onUpdate,
            }),
        );
    }, [dispatch, extraSettings, onUpdate, isMarkup]);

    return (
        <PlaceholderComponent
            qa="placeholder-metric-colors"
            id="metric-colors"
            iconProps={{data: BucketPaint}}
            title="section_colors"
            hasSettings={true}
            onActionIconClick={handleOpenDialogMetricColors}
            actionIconQa={PlaceholderActionQa.OpenMetricColorDialogIcon}
            items={[]}
            checkAllowed={() => false}
            onUpdate={() => {}}
            wrapTo={() => null}
            disabled={false}
            disabledText={i18n('label_metric-colors-edit-field-disabled')}
            addFieldDisableText={i18n('label_metric-colors-add-field-disabled')}
        />
    );
};
