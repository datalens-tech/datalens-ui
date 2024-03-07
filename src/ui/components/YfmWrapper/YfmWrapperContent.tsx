import React from 'react';

import '@diplodoc/transform/dist/js/yfm';

import {YFM_MARKDOWN_CLASSNAME} from '../../constants/yfm';

import '@diplodoc/transform/dist/css/yfm.css';
// eslint-disable-next-line import/order
import './YfmWrapperContent.scss';

type YfmWrapperProps = {
    content: React.ReactNode | string;
    setByInnerHtml?: boolean;
    className?: string;
};

export const YfmWrapperContent = React.forwardRef<HTMLDivElement, YfmWrapperProps>(
    ({content, setByInnerHtml, className}, ref) => {
        const componentClassName = className ? ` ${className}` : '';

        const yfmClassName = `${YFM_MARKDOWN_CLASSNAME}${componentClassName}`;
        const yfmContent = setByInnerHtml ? (content as string) || '' : content;

        if (setByInnerHtml) {
            return (
                <div
                    ref={ref}
                    className={yfmClassName}
                    dangerouslySetInnerHTML={{__html: String(yfmContent)}}
                />
            );
        }

        return (
            <div ref={ref} className={yfmClassName}>
                {yfmContent}
            </div>
        );
    },
);

YfmWrapperContent.displayName = 'YfmWrapperContent';
