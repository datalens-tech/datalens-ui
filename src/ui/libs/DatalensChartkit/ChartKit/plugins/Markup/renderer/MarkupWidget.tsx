import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';

import {ChartQa} from '../../../../../../../shared';
import {Markup} from '../../../../../../components/Markup';
import Performance from '../../../../modules/perfomance';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../helpers/constants';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {MarkupWidgetProps} from '../types';

import './MarkupWidget.scss';

const b = block('chartkit-markup');

const MarkupWidget = React.forwardRef<ChartKitWidgetRef | undefined, MarkupWidgetProps>(
    (props, _ref) => {
        const {
            id,
            onLoad,
            data: {data},
        } = props;

        const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, id]);

        Performance.mark(generatedId);

        React.useLayoutEffect(() => {
            onLoad?.({widgetRendering: Performance.getDuration(generatedId)});
        }, [generatedId, onLoad]);

        if (!data || (typeof data === 'object' && !Object.keys(data).length)) {
            throw new ChartKitError({
                code: CHARTKIT_ERROR_CODE.NO_DATA,
            });
        }

        return (
            <div className={b('content', CHARTKIT_SCROLLABLE_NODE_CLASSNAME)}>
                <div data-qa={ChartQa.Chart} className={b()}>
                    <Markup item={data.value} />
                </div>
            </div>
        );
    },
);

MarkupWidget.displayName = 'MarkupWidget';

export default MarkupWidget;
