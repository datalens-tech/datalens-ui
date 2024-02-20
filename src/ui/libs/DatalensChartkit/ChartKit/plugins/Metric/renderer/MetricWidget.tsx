import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';

import {ChartQa} from '../../../../../../../shared';
import Performance from '../../../../modules/perfomance';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../helpers/constants';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {MetricWidgetProps} from '../types';

import {MetricTile} from './MetricTile';

import './MetricWidget.scss';

const b = block('chartkit-metric');

// eslint-disable-next-line react/display-name
const MetricWidget = React.forwardRef<ChartKitWidgetRef | undefined, MetricWidgetProps>(
    // _ref needs to avoid this React warning:
    // "forwardRef render functions accept exactly two parameters: props and ref"
    (props, _ref) => {
        const {
            id,
            onLoad,
            data: {data, config},
        } = props;

        const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, config, id]);
        Performance.mark(generatedId);

        React.useLayoutEffect(() => {
            // TODO: swap to onRender after https://github.com/gravity-ui/chartkit/issues/33
            onLoad?.({widgetRendering: Performance.getDuration(generatedId)});
        }, [generatedId, onLoad]);

        if (!data || (Array.isArray(data) && !data.length)) {
            throw new ChartKitError({
                code: CHARTKIT_ERROR_CODE.NO_DATA,
            });
        }

        return (
            <div data-qa={ChartQa.Chart} className={b()}>
                <div className={b('wrapper')}>
                    <div className={CHARTKIT_SCROLLABLE_NODE_CLASSNAME}>
                        {(Array.isArray(data) ? data : [data]).map((metricData, index) => (
                            <MetricTile key={index} data={metricData} config={config} />
                        ))}
                    </div>
                </div>
            </div>
        );
    },
);

export default MetricWidget;
