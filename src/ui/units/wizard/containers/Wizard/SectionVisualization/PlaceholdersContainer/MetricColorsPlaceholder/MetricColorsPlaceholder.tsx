import React from 'react';

import {BucketPaint} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {CommonSharedExtraSettings} from 'shared';
import {PlaceholderActionQa} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {openDialogMetricColors} from '../../../../../actions/dialog';
import {selectExtraSettings} from '../../../../../selectors/widget';
import PlaceholderComponent from '../Placeholder/Placeholder';

type MetricColorsPlaceholderProps = {
    onUpdate?: () => void;
};

export const MetricColorsPlaceholder: React.FC<MetricColorsPlaceholderProps> = ({onUpdate}) => {
    const dispatch = useDispatch();
    const extraSettings = useSelector(
        (state: DatalensGlobalState) => selectExtraSettings(state) as CommonSharedExtraSettings,
    );

    const handleOpenDialogMetricColors = React.useCallback(() => {
        dispatch(
            openDialogMetricColors({
                extraSettings,
                onApply: onUpdate,
            }),
        );
    }, [dispatch, extraSettings, onUpdate]);

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
            addFieldDisableText={i18n('wizard', 'label_metric-colors-add-field-disabled')}
        />
    );
};
