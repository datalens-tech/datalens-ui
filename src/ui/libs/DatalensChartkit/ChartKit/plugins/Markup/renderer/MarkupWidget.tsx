import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';

import {ChartQa} from '../../../../../../../shared';
import {Markup} from '../../../../../../components/Markup';
import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {MarkupWidgetProps} from '../types';

import './MarkupWidget.scss';

const b = block('chartkit-markup');

const MarkupWidget = React.forwardRef<ChartKitWidgetRef | undefined, MarkupWidgetProps>(
    (props, _ref) => {
        const {
            id,
            onRender,
            data: {data},
        } = props;

        const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, id]);

        Performance.mark(generatedId);

        React.useLayoutEffect(() => {
            onRender?.({renderTime: Performance.getDuration(generatedId)});
        }, [generatedId, onRender]);

        if (!data) {
            throw new ChartKitError({
                code: CHARTKIT_ERROR_CODE.NO_DATA,
            });
        }

        return (
            <div data-qa={ChartQa.Chart} className={b()}>
                <Markup item={data.value} />
            </div>
        );
    },
);

MarkupWidget.displayName = 'MarkupWidget';

export default MarkupWidget;
