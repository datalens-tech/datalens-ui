import React from 'react';

import block from 'bem-cn-lite';
import isEmpty from 'lodash/isEmpty';
import {formatNumber} from 'shared';

import './Tooltip.scss';

const b = block('yandex-map-tooltip');

type HintProps = {
    name?: string;
    value?: number;
    text?: string;
    data?: {
        text?: string;
        color?: string;
    }[];
};

type Props = {context: React.Context<unknown>};
type HintContext = React.Context<{hint?: HintProps}>;

export const Tooltip = (props: Props) => {
    const hintContext = React.useContext(props.context as HintContext);

    if (!hintContext?.hint || isEmpty(hintContext.hint)) {
        return null;
    }

    const {name: title, value, text, data} = hintContext.hint;
    const formattedValue = typeof value === 'number' ? formatNumber(value) : null;

    return (
        <div className={b()}>
            {title && <div className={b('title')}>{title}</div>}
            <div className={b('row')}>
                {formattedValue && <div className={b('cell')}>{formattedValue}</div>}
                {text && <div className={b('cell')}>{text}</div>}
            </div>
            {data?.map((d, index) => (
                <div key={`data-${index}`} className={b('row')}>
                    {d.color && (
                        <div className={b('cell')}>
                            <span className={b('color')} style={{backgroundColor: d.color}} />
                        </div>
                    )}
                    {d.text && <div className={b('cell')}>{d.text}</div>}
                </div>
            ))}
        </div>
    );
};
