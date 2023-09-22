import React from 'react';

import block from 'bem-cn-lite';

import {YfmWrapper} from '../../../../YfmWrapper/YfmWrapper';

import {DASH_WIDGET_CLASSNAME} from './helpers';

import '../Widget.scss';

export type FooterProps = {
    isFullscreen: boolean;
    description: string | null;
    withPaddings?: boolean;
    customClassName?: string;
};

export const Footer = (props: FooterProps) => {
    const {isFullscreen, description, withPaddings, customClassName} = props;

    const b = React.useMemo(
        () => block(customClassName || DASH_WIDGET_CLASSNAME),
        [customClassName],
    );

    return (
        <React.Fragment>
            {description && !isFullscreen && (
                <div className={b('description', {'with-paddings': Boolean(withPaddings)})}>
                    <YfmWrapper content={description} setByInnerHtml={true} />
                </div>
            )}
        </React.Fragment>
    );
};
