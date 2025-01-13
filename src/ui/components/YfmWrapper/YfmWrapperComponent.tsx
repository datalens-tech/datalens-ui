import React from 'react';

import '@diplodoc/cut-extension/runtime';
import '@diplodoc/transform/dist/js/_yfm-only';
import '@diplodoc/transform/dist/js/base';

import '@diplodoc/transform/dist/css/base.css'; // eslint-disable-line import/order
import '@diplodoc/transform/dist/css/_yfm-only.css'; // eslint-disable-line import/order
import '@diplodoc/cut-extension/runtime/styles.css'; // eslint-disable-line import/order

import {YFM_MARKDOWN_CLASSNAME} from '../../constants/yfm';

import type {YfmWrapperProps} from './types';

const YfmWrapperComponent = React.forwardRef<HTMLDivElement, YfmWrapperProps>(
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

YfmWrapperComponent.displayName = 'YfmWrapperComponent';

export default YfmWrapperComponent;
