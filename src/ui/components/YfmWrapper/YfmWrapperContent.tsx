import React from 'react';

import '@doc-tools/transform/dist/js/yfm';

import {YFM_MARKDOWN_CLASSNAME} from '../../constants/yfm';

import '@doc-tools/transform/dist/css/yfm.css';
// eslint-disable-next-line import/order
import './YfmWrapperContent.scss';

type YfmWrapperProps = {
    content: React.ReactNode | string;
    setByInnerHtml?: boolean;
    className?: string;
};

export const YfmWrapperContent = ({content, setByInnerHtml, className}: YfmWrapperProps) => {
    const refLink = React.useRef<HTMLDivElement>(null);
    const componentClassName = className ? ` ${className}` : '';
    const yfmClassName = `${YFM_MARKDOWN_CLASSNAME}${componentClassName}`;

    const yfmContent = setByInnerHtml ? (content as string) || '' : content;

    if (setByInnerHtml) {
        return (
            <div
                ref={refLink}
                className={yfmClassName}
                dangerouslySetInnerHTML={{__html: String(yfmContent)}}
            />
        );
    }

    return (
        <div ref={refLink} className={yfmClassName}>
            {yfmContent}
        </div>
    );
};
