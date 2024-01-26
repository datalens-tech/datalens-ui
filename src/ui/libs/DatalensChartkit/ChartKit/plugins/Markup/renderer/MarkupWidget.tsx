import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';

import {Markup} from '../../../../../../components/Markup';
import {MarkupItemType} from '../../../../../../components/Markup/types';
import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {MarkupWidgetProps} from '../types';

import './MarkupWidget.scss';

const b = block('chartkit-markup');

// eslint-disable-next-line react/display-name
const MarkupWidget = React.forwardRef<ChartKitWidgetRef | undefined, MarkupWidgetProps>(
    // _ref needs to avoid this React warning:
    // "forwardRef render functions accept exactly two parameters: props and ref"
    (props, _ref) => {
        const {
            id,
            onLoad,
            data: {data},
        } = props;

        const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, id]);

        Performance.mark(generatedId);

        React.useLayoutEffect(() => {
            // TODO: swap to onRender after https://github.com/gravity-ui/chartkit/issues/33
            onLoad?.({widgetRendering: Performance.getDuration(generatedId)});
        }, [generatedId, onLoad]);

        if (!data) {
            throw new ChartKitError({
                code: CHARTKIT_ERROR_CODE.NO_DATA,
            });
        }

        const tempValue = {
            type: 'concat' as MarkupItemType,
            children: [
                {
                    type: 'bold' as MarkupItemType,
                    content: {
                        type: 'text' as MarkupItemType,
                        content: 'Bold ololo',
                    },
                },
                {
                    type: 'italics' as MarkupItemType,
                    content: {
                        type: 'text' as MarkupItemType,
                        content: ' Italic ololo',
                    },
                },
            ],
        };

        return (
            <div className={b()}>
                <div className={b('wrapper')}>
                    <Markup
                        item={tempValue}
                        externalProps={{
                            url: {
                                onClick: (event: React.SyntheticEvent) => {
                                    // need to stop propagation for link components because it works incorrect with sorting by rows
                                    // user click by link it leads to call both actions at the same time
                                    // now clicking on the link will only open it without sorting table
                                    event.stopPropagation();
                                },
                            },
                        }}
                    />
                </div>
            </div>
        );
    },
);

export default MarkupWidget;
